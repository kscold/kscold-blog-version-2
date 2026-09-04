package com.kscold.blog.blog.adapter.in.web.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** 태그 병합 요청. sourceId 태그의 글·피드를 targetId 태그로 옮기고 sourceId 를 지운다. */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MergeTagRequest {

    @NotBlank private String sourceId;

    @NotBlank private String targetId;
}
