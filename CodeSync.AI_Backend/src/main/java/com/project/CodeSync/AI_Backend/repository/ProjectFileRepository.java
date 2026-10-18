package com.project.CodeSync.AI_Backend.repository;


import com.project.CodeSync.AI_Backend.entity.ProjectFile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectFileRepository extends JpaRepository<ProjectFile, Long> {

    List<ProjectFile> findAllByProjectIdOrderByPathAsc(Long projectId);

    Optional<ProjectFile> findByProjectIdAndPath(Long projectId, String path);

    void deleteByProjectIdAndPath(Long projectId, String path);

    boolean existsByProjectIdAndPath(Long projectId, String path);
}