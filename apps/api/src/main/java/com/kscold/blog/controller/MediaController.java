package com.kscold.blog.controller;

import com.kscold.blog.dto.response.ApiResponse;
import com.kscold.blog.service.MediaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/media")
@RequiredArgsConstructor
public class MediaController {

    private final MediaService mediaService;

    @PostMapping("/upload")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, String>>> upload(
            @RequestParam("file") MultipartFile file
    ) {
        String url = mediaService.upload(file);

        Map<String, String> response = new HashMap<>();
        response.put("url", url);

        return ResponseEntity.ok(
                ApiResponse.success(response, "파일이 업로드되었습니다")
        );
    }

    @DeleteMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(
            @RequestParam("url") String url
    ) {
        mediaService.delete(url);

        return ResponseEntity.ok(
                ApiResponse.success(null, "파일이 삭제되었습니다")
        );
    }
}
