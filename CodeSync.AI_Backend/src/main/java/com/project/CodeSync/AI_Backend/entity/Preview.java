package com.project.CodeSync.AI_Backend.entity;



import com.project.CodeSync.AI_Backend.enums.PreviewStatus;
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
@Table(name="previews")
public class Preview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="project_id",nullable = false)
    Project project;

    String namespace;
    String podName;
    String previewUrl;

    @Enumerated(EnumType.STRING) //It is used to tell JPA/Hibernate how to store an enum in the database.
    @Column(nullable = false)
    PreviewStatus status;

    Instant startedAt;
    Instant terminatedAt;

    @Column(nullable = false,updatable = false)
    Instant createdAt;

    // "Run this method automatically just before saving a new entity into the database."
    @PrePersist
    void onCreate(){
        createdAt = Instant.now();
    }
}
