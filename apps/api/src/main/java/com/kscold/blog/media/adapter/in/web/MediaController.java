package com.kscold.blog.media.adapter.in.web;

import com.kscold.blog.media.adapter.in.web.dto.MediaResponse;
import com.kscold.blog.media.application.port.in.MediaUseCase;
import com.kscold.blog.media.domain.model.Media;
import com.kscold.blog.shared.web.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@RestController
@RequestMapping("/api/media")
@RequiredArgsConstructor
public class MediaController {

    private final MediaUseCase mediaUseCase;

    @PostMapping("/upload")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<MediaResponse>> upload(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal String userId
    ) {
        Media media = mediaUseCase.upload(file, userId, userId);
        return ResponseEntity.ok(ApiResponse.success(MediaResponse.from(media), "파일이 업로드되었습니다"));
    }

    @DeleteMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@RequestParam("url") String url) {
        mediaUseCase.delete(url);
        return ResponseEntity.noContent().build();
    }
}
