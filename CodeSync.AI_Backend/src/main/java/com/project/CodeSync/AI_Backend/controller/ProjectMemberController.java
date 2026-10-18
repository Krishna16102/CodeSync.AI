
package com.project.CodeSync.AI_Backend.controller;

import com.project.CodeSync.AI_Backend.dto.member.InviteMemberRequest;
import com.project.CodeSync.AI_Backend.dto.member.MemberResponse;
import com.project.CodeSync.AI_Backend.dto.member.UpdateMemberRoleRequest;
import com.project.CodeSync.AI_Backend.enums.ProjectRole;
import com.project.CodeSync.AI_Backend.service.ProjectMemberService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects/{projectId}/members")
@RequiredArgsConstructor
public class ProjectMemberController {

    private final ProjectMemberService projectMemberService;



    @GetMapping
    public ResponseEntity<List<MemberResponse>> getProjectMembers(
            @PathVariable Long projectId
    ) {

        return ResponseEntity.ok(
                projectMemberService.getProjectMembers(
                        projectId
                )
        );
    }



    @GetMapping("/my-role")
    public ResponseEntity<ProjectRole> getMyProjectRole(
            @PathVariable Long projectId
    ) {

        return ResponseEntity.ok(
                projectMemberService.getMyProjectRole(
                        projectId
                )
        );
    }


    @PostMapping
    public ResponseEntity<MemberResponse> inviteMember(
            @PathVariable Long projectId,
            @RequestBody @Valid InviteMemberRequest request
    ) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        projectMemberService.inviteMember(
                                projectId,
                                request
                        )
                );
    }


    @PatchMapping("/{memberId}")
    public ResponseEntity<MemberResponse> updateMemberRole(
            @PathVariable Long projectId,
            @PathVariable Long memberId,
            @RequestBody @Valid UpdateMemberRoleRequest request
    ) {

        return ResponseEntity.ok(
                projectMemberService.updateMemberRole(
                        projectId,
                        memberId,
                        request
                )
        );
    }


    @DeleteMapping("/{memberId}")
    public ResponseEntity<Void> removeMember(
            @PathVariable Long projectId,
            @PathVariable Long memberId
    ) {

        projectMemberService.removeProjectMember(
                projectId,
                memberId
        );

        return ResponseEntity.noContent().build();
    }
}