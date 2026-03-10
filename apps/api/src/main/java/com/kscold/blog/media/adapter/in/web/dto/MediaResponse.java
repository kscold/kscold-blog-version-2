package com.kscold.blog.media.adapter.in.web.dto;

import com.kscold.blog.media.domain.model.Media;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MediaResponse {

    private String id;
    private String url;
    private String originalFilename;
    private String contentType;
    private Long fileSize;
    private LocalDateTime createdAt;

    public static MediaResponse from(Media media) {
        return MediaResponse.builder()
                .id(media.getId())
                .url(media.getFileUrl())
                .originalFilename(media.getOriginalFilename())
                .contentType(media.getContentType())
                .fileSize(media.getFileSize())
                .createdAt(media.getCreatedAt())
                .build();
    }
}
