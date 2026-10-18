
package com.project.CodeSync.AI_Backend.repository;

import com.project.CodeSync.AI_Backend.entity.ProjectMember;
import com.project.CodeSync.AI_Backend.entity.ProjectMemberId;
import com.project.CodeSync.AI_Backend.enums.ProjectRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectMemberRepository
        extends JpaRepository<ProjectMember, ProjectMemberId> {

    List<ProjectMember> findByIdProjectId(
            Long projectId
    );

    Optional<ProjectMember>
    findByIdProjectIdAndProjectRole(
            Long projectId,
            ProjectRole projectRole
    );

    Optional<ProjectMember>
    findByIdProjectIdAndIdUserId(
            Long projectId,
            Long userId
    );
}