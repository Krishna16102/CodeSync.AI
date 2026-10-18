package com.project.CodeSync.AI_Backend.service.impl;

import com.project.CodeSync.AI_Backend.dto.auth.UserProfileResponse;
import com.project.CodeSync.AI_Backend.dto.project.ProjectRequest;
import com.project.CodeSync.AI_Backend.dto.project.ProjectResponse;
import com.project.CodeSync.AI_Backend.dto.project.ProjectSummaryResponse;
import com.project.CodeSync.AI_Backend.entity.Project;
import com.project.CodeSync.AI_Backend.entity.ProjectMember;
import com.project.CodeSync.AI_Backend.entity.ProjectMemberId;
import com.project.CodeSync.AI_Backend.entity.User;
import com.project.CodeSync.AI_Backend.enums.ProjectRole;
import com.project.CodeSync.AI_Backend.error.ResourceNotFoundException;
import com.project.CodeSync.AI_Backend.mapper.ProjectMapper;
import com.project.CodeSync.AI_Backend.mapper.UserMapper;
import com.project.CodeSync.AI_Backend.repository.ProjectMemberRepository;
import com.project.CodeSync.AI_Backend.repository.ProjectRepository;
import com.project.CodeSync.AI_Backend.repository.UserRepository;
import com.project.CodeSync.AI_Backend.security.AuthUtil;
import com.project.CodeSync.AI_Backend.service.ProjectService;
import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(
        makeFinal = true,
        level = AccessLevel.PRIVATE
)
@Transactional
public class ProjectServiceImpl
        implements ProjectService {


    private ProjectRepository projectRepository;

    private UserRepository userRepository;

    private ProjectMapper projectMapper;

    private ProjectMemberRepository projectMemberRepository;

    private AuthUtil authUtil;

    private UserMapper userMapper;



    @Override
    public ProjectResponse createProject(
            ProjectRequest request
    ) {

        Long userId =
                authUtil.getCurrentUserId();


        User owner =
                userRepository.getReferenceById(
                        userId
                );


        Project project =
                Project.builder()
                        .name(request.name())
                        .isPublic(false)
                        .build();


        project =
                projectRepository.save(
                        project
                );


        ProjectMemberId projectMemberId =
                new ProjectMemberId(
                        project.getId(),
                        owner.getId()
                );


        ProjectMember projectMember =
                ProjectMember.builder()
                        .id(projectMemberId)
                        .projectRole(ProjectRole.OWNER)
                        .user(owner)
                        .acceptedAt(Instant.now())
                        .invitedAt(Instant.now())
                        .project(project)
                        .build();


        projectMemberRepository.save(
                projectMember
        );


        ProjectResponse response =
                projectMapper.toProjectResponse(
                        project
                );


        return new ProjectResponse(
                response.id(),
                response.name(),
                response.createdAt(),
                response.updatedAt(),
                userMapper.toUserProfileResponse(
                        owner
                )
        );
    }



    @Override
    public List<ProjectSummaryResponse>
    getUserProjects() {

        Long userId =
                authUtil.getCurrentUserId();


        var projects =
                projectRepository
                        .findAllAccessibleByUser(
                                userId
                        );


        return projectMapper
                .toListOfProjectSummaryResponse(
                        projects
                );
    }



    @Override
    public ProjectResponse getUserProjectById(
            Long id
    ) {

        Long userId =
                authUtil.getCurrentUserId();


        Project project =
                getAccessibleProjectById(
                        id,
                        userId
                );



        User owner =
                projectMemberRepository
                        .findByIdProjectIdAndProjectRole(
                                id,
                                ProjectRole.OWNER
                        )
                        .orElseThrow(
                                () ->
                                        new ResourceNotFoundException(
                                                "Owner for project",
                                                id.toString()
                                        )
                        )
                        .getUser();


        ProjectResponse response =
                projectMapper.toProjectResponse(
                        project
                );


        return new ProjectResponse(
                response.id(),
                response.name(),
                response.createdAt(),
                response.updatedAt(),
                userMapper.toUserProfileResponse(
                        owner
                )
        );
    }



    @Override
    public ProjectResponse updateProject(
            Long id,
            ProjectRequest request
    ) {

        Long userId =
                authUtil.getCurrentUserId();


        requireOwner(
                id,
                userId
        );


        Project project =
                getAccessibleProjectById(
                        id,
                        userId
                );


        project.setName(
                request.name()
        );


        project =
                projectRepository.saveAndFlush(
                        project
                );



        User owner =
                projectMemberRepository
                        .findByIdProjectIdAndProjectRole(
                                id,
                                ProjectRole.OWNER
                        )
                        .orElseThrow(
                                () ->
                                        new ResourceNotFoundException(
                                                "Owner for project",
                                                id.toString()
                                        )
                        )
                        .getUser();


        ProjectResponse response =
                projectMapper.toProjectResponse(
                        project
                );


        return new ProjectResponse(
                response.id(),
                response.name(),
                response.createdAt(),
                response.updatedAt(),
                userMapper.toUserProfileResponse(
                        owner
                )
        );
    }



    @Override
    public void softDelete(
            Long id
    ) {

        Long userId =
                authUtil.getCurrentUserId();



        requireOwner(
                id,
                userId
        );


        Project project =
                getAccessibleProjectById(
                        id,
                        userId
                );


        project.setDeletedAt(
                Instant.now()
        );


        projectRepository.save(
                project
        );
    }


    public Project getAccessibleProjectById(
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



    private void requireOwner(
            Long projectId,
            Long userId
    ) {

        ProjectMember member =
                projectMemberRepository
                        .findById(
                                new ProjectMemberId(
                                        projectId,
                                        userId
                                )
                        )
                        .orElseThrow(
                                () ->
                                        new ResourceNotFoundException(
                                                "Project",
                                                projectId.toString()
                                        )
                        );


        if (
                member.getProjectRole()
                        != ProjectRole.OWNER
        ) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only the project owner can modify project settings."
            );
        }
    }


    public UserProfileResponse getProjectOwner(
            Long projectId
    ) {

        ProjectMember ownerMember =
                projectMemberRepository
                        .findByIdProjectIdAndProjectRole(
                                projectId,
                                ProjectRole.OWNER
                        )
                        .orElseThrow(
                                () ->
                                        new ResourceNotFoundException(
                                                "Owner for project",
                                                projectId.toString()
                                        )
                        );


        return userMapper.toUserProfileResponse(
                ownerMember.getUser()
        );
    }
}