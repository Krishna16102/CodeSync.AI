package com.project.CodeSync.AI_Backend.dto.project;

import java.time.Instant;

public record ProjectSummaryResponse(
        Long id,
        String projectName,
        Instant createdAt,
        Instant updatedAt
) {
}

// A Java record is shorthand — Java automatically generates the constructor,
// getters (id(), name()
