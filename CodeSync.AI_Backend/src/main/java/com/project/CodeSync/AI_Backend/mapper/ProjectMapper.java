
package com.project.CodeSync.AI_Backend.mapper;

import com.project.CodeSync.AI_Backend.dto.project.ProjectResponse;
import com.project.CodeSync.AI_Backend.dto.project.ProjectSummaryResponse;
import com.project.CodeSync.AI_Backend.entity.Project;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ProjectMapper {

    ProjectResponse toProjectResponse(Project project);

    // Copy the value of name into projectName
    @Mapping(target = "projectName", source = "name")
    ProjectSummaryResponse toProjectSummaryResponse(Project project);

    List<ProjectSummaryResponse> toListOfProjectSummaryResponse(List<Project> projects);

}

// @Mapper(componentModel = "spring") tells MapStruct to generate the mapper as a Spring bean.
// This lets Spring inject it into services using dependency injection.
// Without it, the mapper isn't managed by Spring and must be created manually."