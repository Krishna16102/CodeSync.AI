package com.project.CodeSync.AI_Backend.controller;


import com.project.CodeSync.AI_Backend.dto.project.FileContentResponse;
import com.project.CodeSync.AI_Backend.dto.project.FileNode;
import com.project.CodeSync.AI_Backend.dto.project.FileWriteRequest;
import com.project.CodeSync.AI_Backend.security.AuthUtil;
import com.project.CodeSync.AI_Backend.service.FileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/projects/{projectId}/files")
public class FileController {

    private final FileService fileService;

    private final AuthUtil authUtil;



    @GetMapping
    public ResponseEntity<List<FileNode>> getFileTree(
            @PathVariable Long projectId
    ) {

        return ResponseEntity.ok(
                fileService.getFileTree(
                        projectId,
                        authUtil.getCurrentUserId()
                )
        );
    }



    @GetMapping("/content")
    public ResponseEntity<FileContentResponse> getFile(
            @PathVariable Long projectId,
            @RequestParam String path
    ) {

        return ResponseEntity.ok(
                fileService.getFileContent(
                        projectId,
                        path,
                        authUtil.getCurrentUserId()
                )
        );
    }



    @PutMapping
    public ResponseEntity<FileContentResponse>
    createOrUpdateFile(
            @PathVariable Long projectId,
            @RequestBody @Valid FileWriteRequest request
    ) {

        return ResponseEntity.ok(
                fileService.createOrUpdateFile(
                        projectId,
                        request.path(),
                        request.content(),
                        authUtil.getCurrentUserId()
                )
        );
    }


    @DeleteMapping
    public ResponseEntity<Void> deleteFile(
            @PathVariable Long projectId,
            @RequestParam String path
    ) {

        fileService.deleteFile(
                projectId,
                path,
                authUtil.getCurrentUserId()
        );

        return ResponseEntity.noContent().build();
    }
}