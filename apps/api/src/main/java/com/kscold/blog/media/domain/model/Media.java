package com.kscold.blog.media.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "media")
public class Media {
    @Id
    private String id;

    private String originalFilename;
    private String savedFilename;
    private String filePath;
    private String fileUrl;
    private String contentType;
    private Long fileSize;

    private UploaderInfo uploader;

    @CreatedDate
    private LocalDateTime createdAt;

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UploaderInfo {
        private String id;
        private String name;
    }
}
