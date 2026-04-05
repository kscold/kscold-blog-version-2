package com.kscold.blog.media.application.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminStorageObjectResource {
    private String fileName;
    private String contentType;
    private long contentLength;
    private byte[] buffer;
}
