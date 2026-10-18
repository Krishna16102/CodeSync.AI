package com.project.CodeSync.AI_Backend.service.impl;

import com.project.CodeSync.AI_Backend.ai.GroqClient;
import com.project.CodeSync.AI_Backend.dto.chat.ChatMessageResponse;
import com.project.CodeSync.AI_Backend.dto.chat.ChatSessionResponse;
import com.project.CodeSync.AI_Backend.dto.project.FileNode;
import com.project.CodeSync.AI_Backend.entity.*;
import com.project.CodeSync.AI_Backend.enums.MessageRole;
import com.project.CodeSync.AI_Backend.enums.ProjectRole;
import com.project.CodeSync.AI_Backend.error.ResourceNotFoundException;
import com.project.CodeSync.AI_Backend.repository.*;
import com.project.CodeSync.AI_Backend.service.ChatService;
import com.project.CodeSync.AI_Backend.service.FileService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
public class ChatServiceImpl implements ChatService {

    private static final String MARKER = "##FILES_JSON##";

    ChatSessionRepository chatSessionRepository;
    ChatMessageRepository chatMessageRepository;
    ProjectRepository projectRepository;
    ProjectMemberRepository projectMemberRepository;
    UserRepository userRepository;
    FileService fileService;
    GroqClient groqClient;

    ObjectMapper objectMapper = new ObjectMapper();



    private record FileOp(
            String path,
            String action,
            String content
    ) {
    }



    @Override
    public List<ChatMessageResponse> getMessages(
            Long projectId,
            Long userId
    ) {

        getAccessibleProject(
                projectId,
                userId
        );

        ChatSession session =
                getOrCreateSession(
                        projectId,
                        userId
                );

        return chatMessageRepository
                .findAllByChatSessionIdOrderByCreatedAtAsc(
                        session.getId()
                )
                .stream()
                .map(message ->
                        new ChatMessageResponse(
                                message.getId(),
                                message.getRole().name(),
                                message.getContent(),
                                message.getCreatedAt()
                        )
                )
                .toList();
    }



    @Override
    public List<ChatSessionResponse> getSessions(
            Long projectId,
            Long userId
    ) {

        getAccessibleProject(
                projectId,
                userId
        );

        return chatSessionRepository
                .findAllByProjectIdAndDeletedAtIsNullOrderByUpdatedAtDesc(
                        projectId
                )
                .stream()
                .map(session ->
                        new ChatSessionResponse(
                                session.getId(),
                                session.getTitle(),
                                session.getCreatedAt(),
                                session.getUpdatedAt()
                        )
                )
                .toList();
    }



    @Override
    public void streamPrompt(
            Long projectId,
            Long userId,
            String prompt,
            SseEmitter emitter
    ) {


        ProjectRole role =
                getProjectRole(
                        projectId,
                        userId
                );



        if (
                role != ProjectRole.OWNER &&
                        role != ProjectRole.EDITOR
        ) {

            emitter.completeWithError(
                    new AccessDeniedException(
                            "VIEWER is not allowed to use AI"
                    )
            );

            return;
        }



        ChatSession session =
                getOrCreateSession(
                        projectId,
                        userId
                );



        chatMessageRepository.save(
                ChatMessage.builder()
                        .chatSession(session)
                        .role(MessageRole.USER)
                        .content(prompt)
                        .build()
        );



        List<FileNode> tree =
                fileService.getFileTree(
                        projectId,
                        userId
                );



        String systemPrompt =
                buildSystemPrompt(tree);



        StringBuilder fullText =
                new StringBuilder();



        groqClient.streamMessage(

                systemPrompt,

                prompt,



                token -> {

                    fullText.append(token);

                    sendSafe(
                            emitter,
                            "token",
                            token
                    );
                },



                tokensUsed ->
                        onStreamComplete(
                                projectId,
                                userId,
                                session,
                                fullText.toString(),
                                tokensUsed,
                                emitter
                        ),


                error -> {

                    System.err.println("==========================================");
                    System.err.println("GROQ STREAM ERROR");
                    System.err.println(error.getMessage());
                    error.printStackTrace();
                    System.err.println("==========================================");

                    emitter.completeWithError(error);
                }
        );
    }



    private void onStreamComplete(
            Long projectId,
            Long userId,
            ChatSession session,
            String rawText,
            Integer tokensUsed,
            SseEmitter emitter
    ) {


        System.out.println("==========================================");
        System.out.println("RAW GROQ RESPONSE");
        System.out.println("==========================================");
        System.out.println(rawText);
        System.out.println("==========================================");


        String explanation =
                rawText;

        List<FileOp> ops =
                List.of();



        int index =
                rawText.indexOf(
                        MARKER
                );


        System.out.println("FILE MARKER FOUND: " + (index >= 0));



        if (index >= 0) {

            explanation =
                    rawText
                            .substring(
                                    0,
                                    index
                            )
                            .trim();


            String json =
                    rawText
                            .substring(
                                    index + MARKER.length()
                            )
                            .trim();


            System.out.println("==========================================");
            System.out.println("FILE OPERATIONS JSON");
            System.out.println("==========================================");
            System.out.println(json);
            System.out.println("==========================================");


            ops =
                    parseFileOps(
                            json
                    );
        }



        if (ops.isEmpty()) {

            System.out.println("==========================================");
            System.out.println("NO FILE OPERATIONS FOUND");
            System.out.println("==========================================");

        } else {

            System.out.println("==========================================");
            System.out.println("FILE OPERATIONS FOUND: " + ops.size());
            System.out.println("==========================================");

            for (FileOp op : ops) {

                System.out.println(
                        "PATH   : " + op.path()
                );

                System.out.println(
                        "ACTION : " + op.action()
                );
            }
        }



        for (FileOp op : ops) {

            try {

                applyFileOp(
                        projectId,
                        userId,
                        op
                );

            } catch (Exception e) {

                System.err.println("==========================================");
                System.err.println("FILE OPERATION FAILED");
                System.err.println("Path: " + op.path());
                System.err.println("Action: " + op.action());
                System.err.println("Error: " + e.getMessage());
                e.printStackTrace();
                System.err.println("==========================================");
            }
        }




        chatMessageRepository.save(
                ChatMessage.builder()
                        .chatSession(session)
                        .role(MessageRole.ASSISTANT)
                        .content(explanation)
                        .tokensUsed(tokensUsed)
                        .toolCalls(rawJson(ops))
                        .build()
        );




        List<String> changedFiles =
                ops.stream()
                        .map(FileOp::path)
                        .toList();


        System.out.println("==========================================");
        System.out.println("FILES CHANGED");
        System.out.println(changedFiles);
        System.out.println("==========================================");


        sendSafe(
                emitter,
                "done",
                Map.of(
                        "filesChanged",
                        changedFiles
                )
        );


        emitter.complete();
    }


    /*
    |--------------------------------------------------------------------------
    | GET OR CREATE CHAT SESSION
    |--------------------------------------------------------------------------
    */

    private ChatSession getOrCreateSession(
            Long projectId,
            Long userId
    ) {

        return chatSessionRepository
                .findFirstByProjectIdAndDeletedAtIsNullOrderByCreatedAtDesc(
                        projectId
                )
                .orElseGet(() -> {

                    Project project =
                            getAccessibleProject(
                                    projectId,
                                    userId
                            );


                    User user =
                            userRepository.getReferenceById(
                                    userId
                            );


                    return chatSessionRepository.save(

                            ChatSession.builder()
                                    .project(project)
                                    .user(user)
                                    .title("Main chat")
                                    .build()
                    );

                });
    }


    private String buildSystemPrompt(
            List<FileNode> tree
    ) {

        String fileList =
                tree.stream()
                        .map(FileNode::path)
                        .collect(
                                Collectors.joining("\n")
                        );


        return """
            You are an expert AI software engineer and UI/UX designer
            working inside a coding workspace similar to Lovable.

            Your job is to understand the user's request and IMPLEMENT
            the requested change inside the CURRENT PROJECT.

            You are not merely a chatbot that shows code.

            When the user asks for code, a program, a feature, a page,
            a component, an API, a script, or an implementation, your
            default behavior is to modify the project and generate the
            required file operations.


            ============================================================
            CURRENT PROJECT FILES
            ============================================================

            %s


            ============================================================
            CORE DEVELOPMENT RULES
            ============================================================

            - Understand the user's request before modifying files.

            - Inspect the existing project structure shown above.

            - Reuse existing files whenever appropriate.

            - Prefer updating an existing suitable file instead of
              creating duplicate files.

            - Preserve existing functionality unless the user explicitly
              asks you to remove or replace it.

            - Do not rewrite unrelated files.

            - Do not create unnecessary files.

            - Do not create unnecessary folders.

            - Do not create an entire application structure for a small
              request.

            - Keep file paths relative to the project root.

            - Never invent project architecture unnecessarily.

            - Never change the project's technology or framework unless
              the user explicitly requests it.

            - Do not move existing files unless explicitly requested.

            - Do not modify unrelated backend or frontend functionality.


            ============================================================
            CODING AGENT BEHAVIOR
            ============================================================

            You are operating as a coding agent.

            Development requests MUST normally result in project file
            changes.

            Examples:

            User:
            "code for logistic regression in python"

            → IMPLEMENT the Python code in the project.

            User:
            "create a prime number program in Java"

            → IMPLEMENT the Java program in the project.

            User:
            "create a login page"

            → IMPLEMENT the login page in the project.

            User:
            "build a responsive dashboard"

            → IMPLEMENT the dashboard in the project.

            User:
            "add JWT authentication"

            → IMPLEMENT JWT authentication using the existing project
              architecture.

            User:
            "create a React component for a navbar"

            → IMPLEMENT the React component in the project.


            ============================================================
            CHAT-ONLY REQUESTS
            ============================================================

            Only answer normally in chat when the user clearly asks for
            explanation, discussion, learning, debugging advice, or
            review rather than implementation.

            Examples:

            "Explain logistic regression."

            "What is JWT?"

            "How does binary search work?"

            "Why am I getting this error?"

            "Explain this code."

            "What is the difference between JPA and Hibernate?"

            These requests do not require file modifications unless the
            user explicitly asks for implementation.


            ============================================================
            CODE REQUEST INTERPRETATION
            ============================================================

            The following phrases should normally be treated as
            PROJECT IMPLEMENTATION requests:

            - code for X
            - write X in Java
            - write X in Python
            - create X program
            - implement X
            - build X
            - make X
            - add X
            - create a component
            - create a page
            - create an API
            - create a script
            - add a feature
            - develop X
            - generate X


            IMPORTANT:

            If the user says:

            "code for logistic regression in python"

            do NOT simply return Python code as a normal chat response.

            Instead:

            1. Understand the request.
            2. Inspect the current project.
            3. Determine the appropriate Python file.
            4. Create or update the file.
            5. Return the file operation using FILES_JSON.


            ============================================================
            PROJECT STRUCTURE RULES
            ============================================================

            - NEVER create a "src" folder unless "src" already exists
              in the project or the user explicitly requests it.

            - NEVER create a package named "src".

            - NEVER create "src/main/java".

            - NEVER create "src/main/resources".

            - NEVER create "src/components".

            - NEVER create "src/services".

            - NEVER automatically prefix paths with "src/".

            - Preserve the existing project folder structure.

            - Do not invent folders.

            - Do not move existing files.

            - Do not create duplicate directory structures.


            ============================================================
            JAVA PACKAGE RULES
            ============================================================

            When working with Java:

            - Preserve the package structure already used by the project.

            - NEVER create a package named "src".

            - NEVER invent a new package unnecessarily.

            - NEVER create unrelated packages.

            - Follow the existing Spring Boot architecture.

            - Reuse existing controllers, services, repositories, DTOs,
              entities, and configurations whenever appropriate.


            ============================================================
            EXISTING FILE RULES
            ============================================================

            Before creating a new file:

            1. Check whether a suitable file already exists.
            2. If it exists, update it instead.
            3. Preserve unrelated functionality.
            4. Do not create duplicate versions of the same file.

            If the user asks for a modification to an existing file:

            - Update that file.
            - Do not create another file with a similar name.
            - Preserve existing functionality unless it conflicts with
              the requested change.


            ============================================================
            FRONTEND / UI QUALITY
            ============================================================

            When creating or modifying HTML, CSS, React, or frontend UI,
            behave like a professional frontend engineer and product
            designer.

            The result must look polished and production-ready.

            Do NOT generate ugly barebones browser-default UI unless the
            user explicitly asks for a basic example.

            Pay attention to:

            - layout
            - spacing
            - padding
            - typography
            - font hierarchy
            - alignment
            - visual hierarchy
            - colors
            - contrast
            - borders
            - border radius
            - shadows
            - buttons
            - hover states
            - focus states
            - disabled states
            - loading states
            - empty states
            - error states
            - responsive behavior
            - mobile layout
            - desktop layout
            - accessibility
            - readable content width

            Use a consistent design system.

            Avoid:

            - excessive gradients
            - excessive colors
            - excessive shadows
            - huge unnecessary headings
            - excessive cards
            - excessive emojis
            - crowded layouts
            - unnecessary animations

            The final UI should feel like a real modern application.


            ============================================================
            HTML RULES
            ============================================================

            When generating HTML:

            - Use semantic HTML where appropriate.

            - Use meaningful class names.

            - Keep the DOM structure clean.

            - Avoid unnecessary nesting.

            - Make the page responsive.

            - Use proper spacing and typography.

            - Do not rely on browser-default styling.

            - Do not produce an unstyled collection of elements.


            ============================================================
            CSS RULES
            ============================================================

            When generating CSS:

            - Use consistent spacing.

            - Use readable font sizes.

            - Use appropriate line heights.

            - Use sensible max-widths.

            - Avoid unnecessary absolute positioning.

            - Avoid excessive fixed heights.

            - Prevent horizontal overflow.

            - Add hover states to interactive elements.

            - Add focus states where appropriate.

            - Keep selectors maintainable.

            - Preserve existing styles that are unrelated to the request.

            - Keep styles scoped to the appropriate component when possible.


            ============================================================
            REACT RULES
            ============================================================

            When working with React:

            - Reuse existing components when possible.

            - Preserve existing state.

            - Preserve existing API calls.

            - Preserve authentication.

            - Preserve event handlers.

            - Do not remove working functionality unnecessarily.

            - Avoid unnecessary state.

            - Avoid unnecessary re-renders.

            - Handle loading and error states.

            - Keep components readable.

            - Keep the UI responsive.

            - Do not introduce a new library unless it is actually needed.


            ============================================================
            PYTHON RULES
            ============================================================

            When the user requests Python code:

            - Implement the Python code in the project.

            - Use an appropriate Python filename.

            - Preserve the existing Python project structure.

            - Do not create unnecessary packages.

            - Do not create a "src" package unless it already exists.

            - Use clean Python conventions.

            - Add useful comments only where they improve understanding.

            - Do not return only the Python code in chat when the request
              is clearly a coding/implementation request.


            ============================================================
            JAVA RULES
            ============================================================

            When generating Java:

            - Follow Java naming conventions.

            - Preserve the existing package declaration.

            - Use meaningful class and method names.

            - Keep methods focused.

            - Reuse existing project architecture.

            - Do not create unnecessary classes.

            - Do not create unnecessary packages.


            ============================================================
            MODIFICATION SAFETY
            ============================================================

            When improving an existing feature:

            - Understand the existing implementation.

            - Modify only relevant files.

            - Preserve existing functionality.

            - Do not rewrite the entire application.

            - Do not remove working functionality.

            - Do not change backend APIs for a frontend-only request.

            - Do not change frontend code for a backend-only request.


            ============================================================
            FILE GENERATION REQUIREMENT
            ============================================================

            Whenever the user asks for a development implementation,
            you MUST generate file operations.

            This includes requests such as:

            "code for logistic regression in python"

            "create a Java program"

            "build a webpage"

            "create a React component"

            "add authentication"

            "implement an API"

            "make a dashboard"

            "create a form"

            "add a feature"


            Do NOT return only code in the normal response.

            The implementation MUST be represented using:

            %s


            ============================================================
            FILE OPERATION FORMAT
            ============================================================

            Immediately after the marker, output ONLY a valid JSON array.

            Example:

            [
              {
                "path": "logistic_regression.py",
                "action": "create",
                "content": "complete file content..."
              }
            ]


            ============================================================
            ACTION RULES
            ============================================================

            Allowed actions:

            "create"

            "update"

            "delete"


            For CREATE:

            {
              "path": "example.py",
              "action": "create",
              "content": "complete file content"
            }


            For UPDATE:

            {
              "path": "example.py",
              "action": "update",
              "content": "complete updated file content"
            }


            For DELETE:

            {
              "path": "example.py",
              "action": "delete"
            }


            ============================================================
            FILE CONTENT RULES
            ============================================================

            For "create" and "update":

            - Always provide the COMPLETE file content.

            - Never provide a diff.

            - Never provide partial file content.

            - Never use placeholders such as:

              "rest of code here"

              "existing code..."

              "// etc."

            - The file must be usable as-is.

            - Only include files that actually need to change.

            - Do not include unchanged files.


            ============================================================
            JSON RULES
            ============================================================

            The FILES_JSON section MUST contain valid JSON.

            - Use double quotes for JSON strings.

            - Escape quotes inside file content.

            - Escape newlines correctly.

            - Escape backslashes correctly.

            - Do not add markdown fences around the JSON.

            - Do not put comments inside the JSON.

            - Do not add explanatory text after the JSON array.


            ============================================================
            RESPONSE STRUCTURE
            ============================================================

            For a development request, respond in this structure:

            Short explanation of what was implemented.

            %s

            [
              {
                "path": "...",
                "action": "...",
                "content": "..."
              }
            ]

            The JSON array must be the final part of the response.


            ============================================================
            IMPORTANT EXAMPLES
            ============================================================

            Example 1:

            User:
            "code for logistic regression in python"

            Correct behavior:

            Create or update an appropriate Python file.

            Example:

            [
              {
                "path": "logistic_regression.py",
                "action": "create",
                "content": "complete Python implementation..."
              }
            ]


            Example 2:

            User:
            "create a responsive login page"

            Correct behavior:

            Modify the existing frontend files or create the required
            files and return them through FILES_JSON.


            Example 3:

            User:
            "explain logistic regression"

            Correct behavior:

            Answer normally in chat.

            No file operation is required.


            Example 4:

            User:
            "why is my login API returning 401?"

            Correct behavior:

            Explain/debug the issue unless the user explicitly asks you
            to fix the project.


            ============================================================
            FINAL DECISION RULE
            ============================================================

            When the user asks for DEVELOPMENT or CODE GENERATION:

            IMPLEMENT IT IN THE PROJECT.

            When the user asks for EXPLANATION or DISCUSSION:

            ANSWER IN CHAT.

            If the wording is ambiguous but clearly requests code,
            prefer implementation.

            You are a coding agent operating on the user's project,
            not merely a code-answering chatbot.
            """.formatted(
                fileList.isBlank()
                        ? "(empty project)"
                        : fileList,
                MARKER,
                MARKER
        );
    }



    private List<FileOp> parseFileOps(
            String json
    ) {

        try {

            System.out.println("==========================================");
            System.out.println("PARSING FILE OPERATIONS");
            System.out.println("JSON RECEIVED:");
            System.out.println(json);
            System.out.println("==========================================");


            List<FileOp> ops =
                    objectMapper.readValue(
                            json,
                            new TypeReference<List<FileOp>>() {
                            }
                    );


            System.out.println("PARSED FILE OPERATIONS:");

            for (FileOp op : ops) {

                System.out.println(
                        "Path=" + op.path()
                                + ", Action=" + op.action()
                );
            }


            return ops;

        } catch (Exception e) {

            System.err.println("==========================================");
            System.err.println("FILE OPERATION PARSING FAILED");
            System.err.println("JSON RECEIVED:");
            System.err.println(json);
            System.err.println("ERROR:");
            e.printStackTrace();
            System.err.println("==========================================");

            return List.of();
        }
    }



    private void applyFileOp(
            Long projectId,
            Long userId,
            FileOp op
    ) {

        if (
                op == null ||
                        op.path() == null ||
                        op.path().isBlank()
        ) {

            System.out.println(
                    "Skipping invalid file operation."
            );

            return;
        }


        String path =
                op.path().trim();


        String action =
                op.action() == null
                        ? ""
                        : op.action()
                        .trim()
                        .toLowerCase();



        if (
                path.equals("src") ||
                        path.startsWith("src/") ||
                        path.startsWith("src\\")
        ) {

            boolean srcAlreadyExists =
                    fileService
                            .getFileTree(
                                    projectId,
                                    userId
                            )
                            .stream()
                            .anyMatch(
                                    file ->
                                            file.path()
                                                    .equals("src") ||
                                                    file.path()
                                                            .startsWith("src/") ||
                                                    file.path()
                                                            .startsWith("src\\")
                            );


            if (!srcAlreadyExists) {

                System.out.println(
                        "BLOCKED unwanted src path: "
                                + path
                );

                return;
            }
        }



        if ("delete".equals(action)) {

            System.out.println(
                    "Deleting file: " + path
            );

            fileService.deleteFile(
                    projectId,
                    path,
                    userId
            );

            return;
        }



        if (
                "create".equals(action) ||
                        "update".equals(action)
        ) {

            System.out.println(
                    "Writing file: "
                            + path
                            + " | action="
                            + action
            );


            fileService.createOrUpdateFile(
                    projectId,
                    path,
                    op.content() == null
                            ? ""
                            : op.content(),
                    userId
            );

            return;
        }



        System.out.println(
                "Unknown file operation action: "
                        + action
                        + " for "
                        + path
        );
    }



    private String rawJson(
            List<FileOp> ops
    ) {

        try {

            return objectMapper.writeValueAsString(
                    ops
            );

        } catch (Exception e) {

            System.err.println(
                    "Could not serialize file operations."
            );

            e.printStackTrace();

            return "[]";
        }
    }



    private ProjectRole getProjectRole(
            Long projectId,
            Long userId
    ) {

        getAccessibleProject(
                projectId,
                userId
        );


        ProjectMember member =
                projectMemberRepository
                        .findByIdProjectIdAndIdUserId(
                                projectId,
                                userId
                        )
                        .orElseThrow(
                                () ->
                                        new ResourceNotFoundException(
                                                "Project member",
                                                userId.toString()
                                        )
                        );


        return member.getProjectRole();
    }



    private Project getAccessibleProject(
            Long projectId,
            Long userId
    ) {

        return projectRepository
                .findAccessibleProjectById(
                        projectId,
                        userId
                )
                .orElseThrow(
                        () ->
                                new ResourceNotFoundException(
                                        "Project",
                                        projectId.toString()
                                )
                );
    }



    private void sendSafe(
            SseEmitter emitter,
            String eventName,
            Object data
    ) {

        try {

            emitter.send(
                    SseEmitter
                            .event()
                            .name(eventName)
                            .data(data)
            );

        } catch (IOException e) {

            emitter.completeWithError(
                    e
            );
        }
    }
}