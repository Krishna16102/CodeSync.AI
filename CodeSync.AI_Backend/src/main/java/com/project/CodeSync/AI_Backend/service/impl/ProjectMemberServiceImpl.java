package com.project.CodeSync.AI_Backend.service.impl;


import com.project.CodeSync.AI_Backend.dto.member.InviteMemberRequest;
import com.project.CodeSync.AI_Backend.dto.member.MemberResponse;
import com.project.CodeSync.AI_Backend.dto.member.UpdateMemberRoleRequest;
import com.project.CodeSync.AI_Backend.entity.Project;
import com.project.CodeSync.AI_Backend.entity.ProjectMember;
import com.project.CodeSync.AI_Backend.entity.ProjectMemberId;
import com.project.CodeSync.AI_Backend.entity.User;
import com.project.CodeSync.AI_Backend.enums.ProjectRole;
import com.project.CodeSync.AI_Backend.error.ResourceNotFoundException;
import com.project.CodeSync.AI_Backend.mapper.ProjectMemberMapper;
import com.project.CodeSync.AI_Backend.repository.ProjectMemberRepository;
import com.project.CodeSync.AI_Backend.repository.ProjectRepository;
import com.project.CodeSync.AI_Backend.repository.UserRepository;
import com.project.CodeSync.AI_Backend.security.AuthUtil;
import com.project.CodeSync.AI_Backend.security.ProjectPermissionService;
import com.project.CodeSync.AI_Backend.service.ProjectMemberService;
import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;


@Service
@RequiredArgsConstructor
@FieldDefaults(
        makeFinal = true,
        level = AccessLevel.PRIVATE
)
@Transactional
public class ProjectMemberServiceImpl
        implements ProjectMemberService {


    ProjectMemberRepository projectMemberRepository;

    ProjectRepository projectRepository;

    ProjectMemberMapper projectMemberMapper;

    UserRepository userRepository;

    AuthUtil authUtil;

    ProjectPermissionService projectPermissionService;



    @Override
    public List<MemberResponse> getProjectMembers(
            Long projectId
    ) {

        Long userId =
                authUtil.getCurrentUserId();
        projectPermissionService.requireCanView(
                projectId,
                userId
        );


        return projectMemberRepository
                .findByIdProjectId(
                        projectId
                )
                .stream()
                .map(
                        projectMemberMapper
                                ::toProjectMemberResponseFromMember
                )
                .toList();
    }



    @Override
    public MemberResponse inviteMember(
            Long projectId,
            InviteMemberRequest request
    ) {

        Long userId =
                authUtil.getCurrentUserId();



        projectPermissionService.requireOwner(
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



        User invitee =
                userRepository
                        .findByUsername(
                                request.username()
                        )
                        .orElseThrow(
                                () ->
                                        new ResourceNotFoundException(
                                                "User",
                                                request.username()
                                        )
                        );



        if (
                invitee.getId()
                        .equals(userId)
        ) {

            throw new IllegalArgumentException(
                    "Cannot invite yourself"
            );
        }


        ProjectMemberId projectMemberId =
                new ProjectMemberId(
                        projectId,
                        invitee.getId()
                );



        if (
                projectMemberRepository
                        .existsById(
                                projectMemberId
                        )
        ) {

            throw new IllegalArgumentException(
                    "User is already a member of this project"
            );
        }



        ProjectMember member =
                ProjectMember.builder()
                        .id(projectMemberId)
                        .project(project)
                        .user(invitee)
                        .projectRole(request.role())
                        .invitedAt(Instant.now())
                        .build();


        projectMemberRepository.save(
                member
        );


        return projectMemberMapper
                .toProjectMemberResponseFromMember(
                        member
                );
    }



    @Override
    public ProjectRole getMyProjectRole(
            Long projectId
    ) {

        Long userId =
                authUtil.getCurrentUserId();


        return projectPermissionService
                .getProjectRole(
                        projectId,
                        userId
                );
    }



    @Override
    public MemberResponse updateMemberRole(
            Long projectId,
            Long memberId,
            UpdateMemberRoleRequest request
    ) {

        Long userId =
                authUtil.getCurrentUserId();



        projectPermissionService.requireOwner(
                projectId,
                userId
        );


        ProjectMemberId projectMemberId =
                new ProjectMemberId(
                        projectId,
                        memberId
                );


        ProjectMember projectMember =
                projectMemberRepository
                        .findById(
                                projectMemberId
                        )
                        .orElseThrow(
                                () ->
                                        new ResourceNotFoundException(
                                                "Project member",
                                                memberId.toString()
                                        )
                        );



        if (
                projectMember
                        .getProjectRole()
                        == ProjectRole.OWNER
        ) {

            throw new AccessDeniedException(
                    "The project owner's role cannot be changed"
            );
        }



        if (
                request.role()
                        == ProjectRole.OWNER
        ) {

            throw new IllegalArgumentException(
                    "Cannot assign OWNER role"
            );
        }


        projectMember.setProjectRole(
                request.role()
        );


        projectMemberRepository.save(
                projectMember
        );


        return projectMemberMapper
                .toProjectMemberResponseFromMember(
                        projectMember
                );
    }



    @Override
    public void removeProjectMember(
            Long projectId,
            Long memberId
    ) {

        Long userId =
                authUtil.getCurrentUserId();



        projectPermissionService.requireOwner(
                projectId,
                userId
        );



        if (
                userId.equals(memberId)
        ) {

            throw new AccessDeniedException(
                    "Project owner cannot remove themselves"
            );
        }


        ProjectMemberId projectMemberId =
                new ProjectMemberId(
                        projectId,
                        memberId
                );


        ProjectMember member =
                projectMemberRepository
                        .findById(
                                projectMemberId
                        )
                        .orElseThrow(
                                () ->
                                        new ResourceNotFoundException(
                                                "Project member",
                                                memberId.toString()
                                        )
                        );



        if (
                member.getProjectRole()
                        == ProjectRole.OWNER
        ) {

            throw new AccessDeniedException(
                    "Project owner cannot be removed"
            );
        }


        projectMemberRepository.delete(
                member
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
}