package com.kscold.blog.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LinkPreviewResponse {
    private String url;
    private String title;
    private String description;
    private String image;
    private String siteName;
}
