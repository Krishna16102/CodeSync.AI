package com.project.CodeSync.AI_Backend.service;

import com.project.CodeSync.AI_Backend.dto.project.ProjectRequest;
import com.project.CodeSync.AI_Backend.dto.project.ProjectResponse;
import com.project.CodeSync.AI_Backend.dto.project.ProjectSummaryResponse;
import org.jspecify.annotations.Nullable;

import java.util.List;

public interface ProjectService {
    List<ProjectSummaryResponse> getUserProjects();

    ProjectResponse getUserProjectById(Long id);

    ProjectResponse createProject(ProjectRequest request);

    ProjectResponse updateProject(Long id, ProjectRequest request);

    void softDelete(Long id);
}
