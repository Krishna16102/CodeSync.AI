package com.project.CodeSync.AI_Backend.security;


import com.project.CodeSync.AI_Backend.entity.ProjectMember;
import com.project.CodeSync.AI_Backend.entity.ProjectMemberId;
import com.project.CodeSync.AI_Backend.enums.ProjectRole;
import com.project.CodeSync.AI_Backend.error.ResourceNotFoundException;
import com.project.CodeSync.AI_Backend.repository.ProjectMemberRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@FieldDefaults(
        makeFinal = true,
        level = AccessLevel.PRIVATE
)
public class ProjectPermissionService {

    ProjectMemberRepository projectMemberRepository;


    public ProjectMember getProjectMember(
            Long projectId,
            Long userId
    ) {

        ProjectMemberId id =
                new ProjectMemberId(
                        projectId,
                        userId
                );

        return projectMemberRepository
                .findById(id)
                .orElseThrow(
                        () -> new ResourceNotFoundException(
                                "Project member",
                                userId.toString()
                        )
                );
    }



    public ProjectRole getProjectRole(
            Long projectId,
            Long userId
    ) {

        return getProjectMember(
                projectId,
                userId
        ).getProjectRole();
    }



    public void requireCanView(
            Long projectId,
            Long userId
    ) {

        getProjectMember(
                projectId,
                userId
        );
    }



    public void requireCanEdit(
            Long projectId,
            Long userId
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

            throw new AccessDeniedException(
                    "You do not have permission to edit files"
            );
        }
    }



    public void requireOwner(
            Long projectId,
            Long userId
    ) {

        ProjectRole role =
                getProjectRole(
                        projectId,
                        userId
                );

        if (role != ProjectRole.OWNER) {

            throw new AccessDeniedException(
                    "Only the project owner can perform this action"
            );
        }
    }



    public boolean hasRole(
            Long projectId,
            Long userId,
            ProjectRole requiredRole
    ) {

        return getProjectRole(
                projectId,
                userId
        ) == requiredRole;
    }
}