package com.kscold.blog.blog.application.dto;

import com.kscold.blog.blog.domain.model.Post;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

/**
 * 포스트 생성 커맨드 DTO
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PostCreateCommand {

    @NotBlank(message = "제목은 필수입니다")
    private String title;

    private String slug;

    @NotBlank(message = "내용은 필수입니다")
    private String content;

    private String excerpt;

    private String coverImage;

    @NotBlank(message = "카테고리는 필수입니다")
    private String categoryId;

    private List<String> tagIds;

    private Post.Status status = Post.Status.DRAFT;

    private Boolean featured = false;

    private String metaTitle;

    private String metaDescription;

    private List<String> keywords;

    private Post.Source source;

    private String originalFilename;
}
