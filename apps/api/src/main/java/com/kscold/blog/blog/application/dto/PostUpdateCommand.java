package com.kscold.blog.blog.application.dto;

import com.kscold.blog.blog.domain.model.Post;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

/**
 * 포스트 수정 커맨드 DTO
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PostUpdateCommand {

    private String title;

    private String slug;

    private String content;

    private String excerpt;

    private String coverImage;

    private String categoryId;

    private List<String> tagIds;

    private Post.Status status;

    private Boolean featured;

    private Boolean publicOverride;

    private String metaTitle;

    private String metaDescription;

    private List<String> keywords;
}
