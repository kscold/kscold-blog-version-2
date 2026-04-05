package com.kscold.blog.media.application.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.NoArgsConstructor;

@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminStorageObjectItem {
    @lombok.Getter
    private String name;
    @lombok.Getter
    private String key;
    @lombok.Getter
    private long size;
    @lombok.Getter
    private String lastModified;
    private boolean image;
    @lombok.Getter
    private String publicUrl;

    @JsonProperty("isImage")
    public boolean isImage() {
        return image;
    }
}
