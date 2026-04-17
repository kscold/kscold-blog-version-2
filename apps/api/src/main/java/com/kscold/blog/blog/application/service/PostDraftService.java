package com.kscold.blog.blog.application.service;

import com.kscold.blog.blog.application.dto.PostCreateCommand;
import com.kscold.blog.blog.application.dto.PostUpdateCommand;
import com.kscold.blog.blog.domain.model.Post;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class PostDraftService {

    public Post createDraft(
            PostCreateCommand command,
            String slug,
            Post.CategoryInfo categoryInfo,
            List<Post.TagInfo> tagInfos,
            Post.AuthorInfo authorInfo
    ) {
        String excerpt = resolveExcerpt(command.getExcerpt(), command.getContent());

        return Post.builder()
                .title(command.getTitle())
                .slug(slug)
                .content(command.getContent())
                .excerpt(excerpt)
                .coverImage(command.getCoverImage())
                .category(categoryInfo)
                .tags(tagInfos)
                .author(authorInfo)
                .status(command.getStatus())
                .source(command.getSource() != null ? command.getSource() : Post.Source.MANUAL)
                .originalFilename(command.getOriginalFilename())
                .featured(command.getFeatured())
                .publicOverride(command.getPublicOverride())
                .seo(buildSeoInfo(command, excerpt))
                .publishedAt(command.getStatus() == Post.Status.PUBLISHED ? LocalDateTime.now() : null)
                .build();
    }

    public void applyUpdate(
            Post post,
            PostUpdateCommand command,
            Post.CategoryInfo categoryInfo,
            List<Post.TagInfo> tagInfos
    ) {
        if (command.getTitle() != null) post.setTitle(command.getTitle());
        if (command.getContent() != null) post.setContent(command.getContent());
        if (command.getExcerpt() != null) post.setExcerpt(command.getExcerpt());
        if (command.getCoverImage() != null) post.setCoverImage(command.getCoverImage());
        if (command.getFeatured() != null) post.setFeatured(command.getFeatured());
        if (command.getPublicOverride() != null) post.setPublicOverride(command.getPublicOverride());
        if (categoryInfo != null) post.setCategory(categoryInfo);
        if (tagInfos != null) post.setTags(tagInfos);

        updatePostStatus(post, command.getStatus());

        if (command.getMetaTitle() != null || command.getMetaDescription() != null || command.getKeywords() != null) {
            post.setSeo(mergeSeoInfo(command, post.getSeo()));
        }
    }

    private String resolveExcerpt(String excerpt, String content) {
        if (excerpt != null && !excerpt.isBlank()) return excerpt;
        if (content == null || content.isBlank()) return "";
        String plainText = content.replaceAll("[#*`\\[\\]()>-]", "").trim();
        return plainText.length() <= 200 ? plainText : plainText.substring(0, 200) + "...";
    }

    private Post.SeoInfo buildSeoInfo(PostCreateCommand command, String excerpt) {
        return Post.SeoInfo.builder()
                .metaTitle(command.getMetaTitle() != null ? command.getMetaTitle() : command.getTitle())
                .metaDescription(command.getMetaDescription() != null ? command.getMetaDescription() : excerpt)
                .keywords(command.getKeywords())
                .build();
    }

    private Post.SeoInfo mergeSeoInfo(PostUpdateCommand command, Post.SeoInfo current) {
        Post.SeoInfo base = current != null ? current : new Post.SeoInfo();
        return Post.SeoInfo.builder()
                .metaTitle(command.getMetaTitle() != null ? command.getMetaTitle() : base.getMetaTitle())
                .metaDescription(command.getMetaDescription() != null ? command.getMetaDescription() : base.getMetaDescription())
                .keywords(command.getKeywords() != null ? command.getKeywords() : base.getKeywords())
                .build();
    }

    private void updatePostStatus(Post post, Post.Status newStatus) {
        if (newStatus == null) return;
        Post.Status oldStatus = post.getStatus();
        post.setStatus(newStatus);
        if (oldStatus != Post.Status.PUBLISHED && newStatus == Post.Status.PUBLISHED) {
            post.setPublishedAt(LocalDateTime.now());
        }
    }
}
