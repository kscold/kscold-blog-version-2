package com.kscold.blog.dto.request;

import com.kscold.blog.model.Post;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

/**
 * 포스트 수정 요청 DTO
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PostUpdateRequest {

    private String title;

    private String slug;

    private String content;

    private String excerpt;

    private String coverImage;

    private String categoryId;

    private List<String> tagIds;

    private Post.Status status;

    private Boolean featured;

    private String metaTitle;

    private String metaDescription;

    private List<String> keywords;
}
