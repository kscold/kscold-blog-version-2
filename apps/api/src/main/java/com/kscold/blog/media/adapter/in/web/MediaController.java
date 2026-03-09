package com.kscold.blog.media.adapter.in.web;

import com.kscold.blog.shared.web.ApiResponse;
import com.kscold.blog.media.application.port.in.MediaUseCase;
import com.kscold.blog.media.domain.model.Media;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/media")
@RequiredArgsConstructor
public class MediaController {

    private final MediaUseCase mediaUseCase;

    @PostMapping("/upload")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, String>>> upload(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal String userId
    ) {
        Media media = mediaUseCase.upload(file, userId, userId);
        Map<String, String> response = Map.of(
                "url", media.getFileUrl(),
                "id", media.getId()
        );
        return ResponseEntity.ok(ApiResponse.success(response, "파일이 업로드되었습니다"));
    }

    @DeleteMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@RequestParam("url") String url) {
        mediaUseCase.delete(url);
        return ResponseEntity.noContent().build();
    }
}
