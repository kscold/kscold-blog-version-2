package com.kscold.blog.media.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminStorageObjectItem {
    private String name;
    private String key;
    private long size;
    private String lastModified;
    private boolean image;
    private String publicUrl;
}
