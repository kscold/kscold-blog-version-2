package com.kscold.blog.blog.application.service;

import com.kscold.blog.blog.application.dto.PostCreateCommand;
import com.kscold.blog.blog.application.dto.PostUpdateCommand;
import com.kscold.blog.blog.application.port.in.PostUseCase;
import com.kscold.blog.blog.domain.model.Category;
import com.kscold.blog.blog.domain.model.Post;
import com.kscold.blog.blog.domain.model.Tag;
import com.kscold.blog.blog.domain.port.out.CategoryRepository;
import com.kscold.blog.blog.domain.port.out.PostRepository;
import com.kscold.blog.blog.domain.port.out.TagRepository;
import com.kscold.blog.exception.DuplicateResourceException;
import com.kscold.blog.exception.ResourceNotFoundException;
import com.kscold.blog.identity.application.port.in.UserQueryPort;
import com.kscold.blog.identity.application.port.in.UserQueryPort.UserInfo;
import com.kscold.blog.util.SlugUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * 포스트 비즈니스 로직 애플리케이션 서비스
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PostApplicationService implements PostUseCase {

    private final PostRepository postRepository;
    private final CategoryRepository categoryRepository;
    private final TagRepository tagRepository;
    private final UserQueryPort userQueryPort;

    /**
     * 포스트 생성
     */
    @Transactional
    public Post create(PostCreateCommand command, String userId) {
        String slug = command.getSlug() != null ? command.getSlug() : generateSlug(command.getTitle());
        Post.CategoryInfo categoryInfo = resolveCategory(command.getCategoryId());
        List<Post.TagInfo> tagInfos = resolveTags(command.getTagIds());
        Post.AuthorInfo authorInfo = resolveAuthor(userId);
        String excerpt = resolveExcerpt(command.getExcerpt(), command.getContent());
        Post.SeoInfo seoInfo = buildSeoInfo(command, excerpt);

        Post post = Post.builder()
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
                .seo(seoInfo)
                .publishedAt(command.getStatus() == Post.Status.PUBLISHED ? LocalDateTime.now() : null)
                .build();

        Post saved = saveWithSlugCheck(post, slug);
        incrementPostCounts(categoryInfo, tagInfos);
        return saved;
    }

    /**
     * 포스트 수정 (부분 업데이트)
     */
    @Transactional
    public Post update(String id, PostUpdateCommand command) {
        Post post = findById(id);

        if (command.getTitle() != null) post.setTitle(command.getTitle());
        if (command.getContent() != null) post.setContent(command.getContent());
        if (command.getExcerpt() != null) post.setExcerpt(command.getExcerpt());
        if (command.getCoverImage() != null) post.setCoverImage(command.getCoverImage());
        if (command.getFeatured() != null) post.setFeatured(command.getFeatured());
        if (command.getPublicOverride() != null) post.setPublicOverride(command.getPublicOverride());

        if (command.getSlug() != null && !command.getSlug().equals(post.getSlug())) {
            if (postRepository.findBySlug(command.getSlug()).isPresent()) {
                throw DuplicateResourceException.slug(command.getSlug());
            }
            post.setSlug(command.getSlug());
        }

        if (command.getCategoryId() != null) {
            post.setCategory(resolveCategory(command.getCategoryId()));
        }

        if (command.getTagIds() != null) {
            post.setTags(resolveTags(command.getTagIds()));
        }

        updatePostStatus(post, command.getStatus());

        if (command.getMetaTitle() != null || command.getMetaDescription() != null || command.getKeywords() != null) {
            post.setSeo(mergeSeoInfo(command, post.getSeo()));
        }

        return postRepository.save(post);
    }

    /**
     * 포스트 삭제 (Soft Delete - ARCHIVED 상태로 변경)
     */
    @Transactional
    public void delete(String id) {
        Post post = findById(id);
        post.setStatus(Post.Status.ARCHIVED);
        postRepository.save(post);

        if (post.getCategory() != null) {
            categoryRepository.decrementPostCount(post.getCategory().getId());
        }
        if (post.getTags() != null) {
            for (Post.TagInfo tagInfo : post.getTags()) {
                tagRepository.decrementPostCount(tagInfo.getId());
            }
        }
    }

    /**
     * 내부 조회용 (조회수 미증가)
     */
    private Post findById(String id) {
        return postRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.post(id));
    }

    /**
     * 포스트 조회 (ID) - 조회수 증가
     */
    @Transactional
    public Post getById(String id) {
        Post post = findById(id);
        post.setViews(post.getViews() + 1);
        return postRepository.save(post);
    }

    /**
     * 포스트 조회 (Slug) - 조회수 증가
     */
    @Transactional
    public Post getBySlug(String slug) {
        Post post = postRepository.findBySlug(slug)
                .orElseThrow(() -> ResourceNotFoundException.postBySlug(slug));
        post.setViews(post.getViews() + 1);
        return postRepository.save(post);
    }

    /**
     * 전체 포스트 조회 (페이지네이션)
     */
    public Page<Post> getAll(Pageable pageable) {
        return postRepository.findByStatus(Post.Status.PUBLISHED, pageable);
    }

    /**
     * 관리자용 전체 포스트 조회 (모든 상태)
     */
    public Page<Post> getAllAdmin(Pageable pageable) {
        return postRepository.findAll(pageable);
    }

    /**
     * 추천 포스트 조회
     */
    public List<Post> getFeatured(Pageable pageable) {
        return postRepository.findFeaturedPosts(pageable);
    }

    /**
     * 카테고리별 포스트 조회
     */
    public Page<Post> getByCategory(String categoryId, Pageable pageable) {
        return postRepository.findByCategoryIdAndPublished(categoryId, pageable);
    }

    /**
     * 태그별 포스트 조회
     */
    public Page<Post> getByTag(String tagId, Pageable pageable) {
        return postRepository.findByTagIdAndPublished(tagId, pageable);
    }

    /**
     * 포스트 검색 (제목 + 내용 전문 검색)
     */
    public Page<Post> search(String keyword, Pageable pageable) {
        return postRepository.searchByText(keyword, pageable);
    }

    /**
     * 슬러그 존재 여부 확인
     */
    public boolean existsBySlug(String slug) {
        return postRepository.existsBySlug(slug);
    }

    // ── 헬퍼 메서드 ──────────────────────────────────────────────────────────

    private Post.CategoryInfo resolveCategory(String categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> ResourceNotFoundException.category(categoryId));
        return Post.CategoryInfo.builder()
                .id(category.getId())
                .name(category.getName())
                .slug(category.getSlug())
                .build();
    }

    private List<Post.TagInfo> resolveTags(List<String> tagIds) {
        List<Post.TagInfo> tagInfos = new ArrayList<>();
        if (tagIds == null || tagIds.isEmpty()) return tagInfos;

        List<Tag> tags = tagRepository.findAllById(tagIds);
        if (tags.size() != tagIds.size()) {
            throw ResourceNotFoundException.tag("일부 태그를 찾을 수 없습니다");
        }
        for (Tag tag : tags) {
            tagInfos.add(Post.TagInfo.builder().id(tag.getId()).name(tag.getName()).build());
        }
        return tagInfos;
    }

    private Post.AuthorInfo resolveAuthor(String userId) {
        UserInfo userInfo = userQueryPort.getUserById(userId);
        return Post.AuthorInfo.builder()
                .id(userInfo.id())
                .name(userInfo.displayName())
                .build();
    }

    private String resolveExcerpt(String excerpt, String content) {
        if (excerpt != null && !excerpt.isBlank()) return excerpt;
        if (content == null || content.isBlank()) return "";
        String plainText = content.replaceAll("[#*`\\[\\]()>-]", "").trim();
        return plainText.length() <= 200 ? plainText : plainText.substring(0, 200) + "...";
    }

    private Post.SeoInfo buildSeoInfo(PostCreateCommand cmd, String excerpt) {
        return Post.SeoInfo.builder()
                .metaTitle(cmd.getMetaTitle() != null ? cmd.getMetaTitle() : cmd.getTitle())
                .metaDescription(cmd.getMetaDescription() != null ? cmd.getMetaDescription() : excerpt)
                .keywords(cmd.getKeywords())
                .build();
    }

    private Post saveWithSlugCheck(Post post, String slug) {
        try {
            return postRepository.save(post);
        } catch (DuplicateKeyException e) {
            throw DuplicateResourceException.slug(slug);
        }
    }

    private void incrementPostCounts(Post.CategoryInfo cat, List<Post.TagInfo> tags) {
        categoryRepository.incrementPostCount(cat.getId());
        for (Post.TagInfo tagInfo : tags) {
            tagRepository.incrementPostCount(tagInfo.getId());
        }
    }

    private Post.SeoInfo mergeSeoInfo(PostUpdateCommand cmd, Post.SeoInfo current) {
        Post.SeoInfo base = current != null ? current : new Post.SeoInfo();
        return Post.SeoInfo.builder()
                .metaTitle(cmd.getMetaTitle() != null ? cmd.getMetaTitle() : base.getMetaTitle())
                .metaDescription(cmd.getMetaDescription() != null ? cmd.getMetaDescription() : base.getMetaDescription())
                .keywords(cmd.getKeywords() != null ? cmd.getKeywords() : base.getKeywords())
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

    private String generateSlug(String title) {
        return SlugUtils.generate(title);
    }
}
