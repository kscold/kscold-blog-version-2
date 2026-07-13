package com.kscold.blog.analytics.adapter.in.web.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class PageVisitRequest {
    @NotBlank private String path;
}
