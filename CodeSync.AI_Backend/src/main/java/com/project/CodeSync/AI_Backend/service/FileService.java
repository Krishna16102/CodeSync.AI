package com.project.CodeSync.AI_Backend.service;

import com.project.CodeSync.AI_Backend.dto.project.FileContentResponse;
import com.project.CodeSync.AI_Backend.dto.project.FileNode;
import org.jspecify.annotations.Nullable;

import java.util.List;

public interface FileService {
    List<FileNode> getFileTree(Long projectId, Long userId);

    FileContentResponse getFileContent(Long projectId, String path, Long userId);

    FileContentResponse createOrUpdateFile(Long projectId, String path, String content, Long userId);

    void deleteFile(Long projectId, String path, Long userId);
}
