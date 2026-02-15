package com.kscold.blog.service;

import com.kscold.blog.dto.request.PostCreateRequest;
import com.kscold.blog.dto.request.PostUpdateRequest;
import com.kscold.blog.exception.DuplicateResourceException;
import com.kscold.blog.exception.ResourceNotFoundException;
import com.kscold.blog.model.Category;
import com.kscold.blog.model.Post;
import com.kscold.blog.model.Tag;
import com.kscold.blog.model.User;
import com.kscold.blog.repository.CategoryRepository;
import com.kscold.blog.repository.PostRepository;
import com.kscold.blog.repository.TagRepository;
import com.kscold.blog.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * 포스트 비즈니스 로직 서비스
 */
@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;
    private final CategoryRepository categoryRepository;
    private final TagRepository tagRepository;
    private final UserRepository userRepository;

    /**
     * 포스트 생성
     * - 슬러그 자동 생성 (제목 기반)
     * - 카테고리 및 태그 검증
     * - excerpt 자동 생성 (없는 경우)
     * - PUBLISHED 상태면 publishedAt 설정
     */
    @Transactional
    public Post create(PostCreateRequest request, String userId) {
        // 슬러그 생성 및 중복 체크
        String slug = request.getSlug() != null ? request.getSlug() : generateSlug(request.getTitle());
        if (postRepository.findBySlug(slug).isPresent()) {
            throw DuplicateResourceException.slug(slug);
        }

        // 카테고리 검증 및 정보 추출
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> ResourceNotFoundException.category(request.getCategoryId()));

        Post.CategoryInfo categoryInfo = Post.CategoryInfo.builder()
                .id(category.getId())
                .name(category.getName())
                .slug(category.getSlug())
                .build();

        // 태그 검증 및 정보 추출
        List<Post.TagInfo> tagInfos = new ArrayList<>();
        if (request.getTagIds() != null && !request.getTagIds().isEmpty()) {
            for (String tagId : request.getTagIds()) {
                Tag tag = tagRepository.findById(tagId)
                        .orElseThrow(() -> ResourceNotFoundException.tag(tagId));
                tagInfos.add(Post.TagInfo.builder()
                        .id(tag.getId())
                        .name(tag.getName())
                        .build());
            }
        }

        // 작성자 정보 추출
        User author = userRepository.findById(userId)
                .orElseThrow(() -> ResourceNotFoundException.user(userId));

        Post.AuthorInfo authorInfo = Post.AuthorInfo.builder()
                .id(author.getId())
                .name(author.getProfile() != null ? author.getProfile().getDisplayName() : author.getUsername())
                .build();

        // excerpt 자동 생성 (없는 경우 content의 앞 200자)
        String excerpt = request.getExcerpt();
        if (excerpt == null || excerpt.isBlank()) {
            excerpt = generateExcerpt(request.getContent());
        }

        // SEO 정보 생성
        Post.SeoInfo seoInfo = Post.SeoInfo.builder()
                .metaTitle(request.getMetaTitle() != null ? request.getMetaTitle() : request.getTitle())
                .metaDescription(request.getMetaDescription() != null ? request.getMetaDescription() : excerpt)
                .keywords(request.getKeywords())
                .build();

        // Post 생성
        Post post = Post.builder()
                .title(request.getTitle())
                .slug(slug)
                .content(request.getContent())
                .excerpt(excerpt)
                .coverImage(request.getCoverImage())
                .category(categoryInfo)
                .tags(tagInfos)
                .author(authorInfo)
                .status(request.getStatus())
                .featured(request.getFeatured())
                .seo(seoInfo)
                .publishedAt(request.getStatus() == Post.Status.PUBLISHED ? LocalDateTime.now() : null)
                .build();

        return postRepository.save(post);
    }

    /**
     * 포스트 수정 (부분 업데이트)
     */
    @Transactional
    public Post update(String id, PostUpdateRequest request) {
        Post post = getById(id);

        // 제목 수정
        if (request.getTitle() != null) {
            post.setTitle(request.getTitle());
        }

        // 슬러그 수정 (중복 체크)
        if (request.getSlug() != null && !request.getSlug().equals(post.getSlug())) {
            if (postRepository.findBySlug(request.getSlug()).isPresent()) {
                throw DuplicateResourceException.slug(request.getSlug());
            }
            post.setSlug(request.getSlug());
        }

        // 내용 수정
        if (request.getContent() != null) {
            post.setContent(request.getContent());
        }

        // excerpt 수정
        if (request.getExcerpt() != null) {
            post.setExcerpt(request.getExcerpt());
        }

        // 커버 이미지 수정
        if (request.getCoverImage() != null) {
            post.setCoverImage(request.getCoverImage());
        }

        // 카테고리 수정
        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> ResourceNotFoundException.category(request.getCategoryId()));

            post.setCategory(Post.CategoryInfo.builder()
                    .id(category.getId())
                    .name(category.getName())
                    .slug(category.getSlug())
                    .build());
        }

        // 태그 수정
        if (request.getTagIds() != null) {
            List<Post.TagInfo> tagInfos = new ArrayList<>();
            for (String tagId : request.getTagIds()) {
                Tag tag = tagRepository.findById(tagId)
                        .orElseThrow(() -> ResourceNotFoundException.tag(tagId));
                tagInfos.add(Post.TagInfo.builder()
                        .id(tag.getId())
                        .name(tag.getName())
                        .build());
            }
            post.setTags(tagInfos);
        }

        // 상태 수정 (PUBLISHED로 변경 시 publishedAt 설정)
        if (request.getStatus() != null) {
            Post.Status oldStatus = post.getStatus();
            post.setStatus(request.getStatus());

            if (oldStatus != Post.Status.PUBLISHED && request.getStatus() == Post.Status.PUBLISHED) {
                post.setPublishedAt(LocalDateTime.now());
            }
        }

        // featured 수정
        if (request.getFeatured() != null) {
            post.setFeatured(request.getFeatured());
        }

        // SEO 정보 수정
        if (request.getMetaTitle() != null || request.getMetaDescription() != null || request.getKeywords() != null) {
            Post.SeoInfo currentSeo = post.getSeo() != null ? post.getSeo() : new Post.SeoInfo();
            post.setSeo(Post.SeoInfo.builder()
                    .metaTitle(request.getMetaTitle() != null ? request.getMetaTitle() : currentSeo.getMetaTitle())
                    .metaDescription(request.getMetaDescription() != null ? request.getMetaDescription() : currentSeo.getMetaDescription())
                    .keywords(request.getKeywords() != null ? request.getKeywords() : currentSeo.getKeywords())
                    .build());
        }

        return postRepository.save(post);
    }

    /**
     * 포스트 삭제 (Soft Delete - ARCHIVED 상태로 변경)
     */
    @Transactional
    public void delete(String id) {
        Post post = getById(id);
        post.setStatus(Post.Status.ARCHIVED);
        postRepository.save(post);
    }

    /**
     * 포스트 조회 (ID) - 조회수 증가
     */
    @Transactional
    public Post getById(String id) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.post(id));

        // 조회수 증가
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

        // 조회수 증가
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
     * 슬러그 생성 (제목 → kebab-case)
     */
    private String generateSlug(String title) {
        return title.toLowerCase()
                .replaceAll("[^a-z0-9가-힣\\s-]", "")
                .replaceAll("\\s+", "-")
                .trim();
    }

    /**
     * excerpt 자동 생성 (content의 앞 200자)
     */
    private String generateExcerpt(String content) {
        if (content == null || content.isBlank()) {
            return "";
        }

        String plainText = content.replaceAll("[#*`\\[\\]()>-]", "").trim();
        if (plainText.length() <= 200) {
            return plainText;
        }

        return plainText.substring(0, 200) + "...";
    }
}
