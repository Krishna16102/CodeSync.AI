package com.project.CodeSync.AI_Backend.service.impl;

import com.project.CodeSync.AI_Backend.dto.project.FileContentResponse;
import com.project.CodeSync.AI_Backend.dto.project.FileNode;
import com.project.CodeSync.AI_Backend.entity.Project;
import com.project.CodeSync.AI_Backend.entity.ProjectFile;
import com.project.CodeSync.AI_Backend.entity.ProjectMember;
import com.project.CodeSync.AI_Backend.entity.User;
import com.project.CodeSync.AI_Backend.enums.ProjectRole;
import com.project.CodeSync.AI_Backend.error.ResourceNotFoundException;
import com.project.CodeSync.AI_Backend.repository.ProjectFileRepository;
import com.project.CodeSync.AI_Backend.repository.ProjectMemberRepository;
import com.project.CodeSync.AI_Backend.repository.ProjectRepository;
import com.project.CodeSync.AI_Backend.repository.UserRepository;
import com.project.CodeSync.AI_Backend.security.AuthUtil;
import com.project.CodeSync.AI_Backend.service.FileService;
import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(
        makeFinal = true,
        level = AccessLevel.PRIVATE
)
@Transactional
public class FileServiceImpl
        implements FileService {

    ProjectFileRepository projectFileRepository;

    ProjectRepository projectRepository;

    ProjectMemberRepository projectMemberRepository;

    UserRepository userRepository;

    AuthUtil authUtil;

    @Override
    public List<FileNode> getFileTree(
            Long projectId,
            Long userId
    ) {

        assertProjectAccessible(
                projectId,
                userId
        );

        return projectFileRepository
                .findAllByProjectIdOrderByPathAsc(projectId)
                .stream()
                .map(
                        file ->
                                new FileNode(
                                        file.getPath(),
                                        file.getUpdatedAt(),
                                        (long)
                                                (
                                                        file.getContent()
                                                                == null
                                                                ? 0
                                                                : file.getContent()
                                                                .getBytes()
                                                                .length
                                                ),
                                        "file"
                                )
                )
                .toList();
    }



    @Override
    public FileContentResponse getFileContent(
            Long projectId,
            String path,
            Long userId
    ) {

        assertProjectAccessible(
                projectId,
                userId
        );

        ProjectFile file =
                projectFileRepository
                        .findByProjectIdAndPath(
                                projectId,
                                path
                        )
                        .orElseThrow(
                                () ->
                                        new ResourceNotFoundException(
                                                "File",
                                                path
                                        )
                        );

        return new FileContentResponse(
                file.getPath(),
                file.getContent()
        );
    }



    @Override
    public FileContentResponse createOrUpdateFile(
            Long projectId,
            String path,
            String content,
            Long userId
    ) {


        assertCanModifyFiles(
                projectId,
                userId
        );


        Project project =
                projectRepository
                        .findById(projectId)
                        .orElseThrow(
                                () ->
                                        new ResourceNotFoundException(
                                                "Project",
                                                projectId.toString()
                                        )
                        );


        User user =
                userRepository
                        .getReferenceById(
                                userId
                        );


        ProjectFile file =
                projectFileRepository
                        .findByProjectIdAndPath(
                                projectId,
                                path
                        )
                        .orElseGet(
                                () ->
                                        ProjectFile
                                                .builder()
                                                .project(project)
                                                .path(path)
                                                .createdBy(user)
                                                .build()
                        );


        file.setContent(
                content
        );


        file.setUpdatedBy(
                user
        );


        file =
                projectFileRepository.save(
                        file
                );


        return new FileContentResponse(
                file.getPath(),
                file.getContent()
        );
    }


    @Override
    public void deleteFile(
            Long projectId,
            String path,
            Long userId
    ) {


        assertOwner(
                projectId,
                userId
        );


        if (
                !projectFileRepository
                        .existsByProjectIdAndPath(
                                projectId,
                                path
                        )
        ) {

            throw new ResourceNotFoundException(
                    "File",
                    path
            );
        }


        projectFileRepository
                .deleteByProjectIdAndPath(
                        projectId,
                        path
                );
    }


    private Project assertProjectAccessible(
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



    private void assertCanModifyFiles(
            Long projectId,
            Long userId
    ) {


        assertProjectAccessible(
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
                                        new RuntimeException(
                                                "You are not a member of this project"
                                        )
                        );


        ProjectRole role =
                member.getProjectRole();



        if (
                role != ProjectRole.OWNER
                        &&
                        role != ProjectRole.EDITOR
        ) {

            throw new RuntimeException(
                    "Only project owner or editor can modify files"
            );
        }
    }


    private void assertOwner(
            Long projectId,
            Long userId
    ) {


        assertProjectAccessible(
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
                                        new RuntimeException(
                                                "You are not a member of this project"
                                        )
                        );


        if (
                member.getProjectRole()
                        != ProjectRole.OWNER
        ) {

            throw new RuntimeException(
                    "Only the project owner can modify files"
            );
        }
    }
}