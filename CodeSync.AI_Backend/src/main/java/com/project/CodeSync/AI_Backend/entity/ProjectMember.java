package com.project.CodeSync.AI_Backend.entity;



import com.project.CodeSync.AI_Backend.enums.ProjectRole;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.Instant;

@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "project_members")
public class ProjectMember {

    @EmbeddedId   // composite primary key (a primary key made up of multiple columns).
    ProjectMemberId id;

    @ManyToOne
    @MapsId("projectId") // "projectId" matches ProjectMemberId.projectId
    Project project;

    @ManyToOne
    @MapsId("userId") // "userId" matches ProjectMemberId.userId
    User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    ProjectRole projectRole;

    Instant invitedAt;
    Instant acceptedAt;

}
