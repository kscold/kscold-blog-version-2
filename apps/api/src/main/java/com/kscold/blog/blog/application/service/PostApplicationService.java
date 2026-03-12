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
     * - 슬러그 자동 생성 (제목 기반)
     * - 카테고리 및 태그 검증
     * - excerpt 자동 생성 (없는 경우)
     * - PUBLISHED 상태면 publishedAt 설정
     */
    @Transactional
    public Post create(PostCreateCommand command, String userId) {
        // 슬러그 생성
        String slug = command.getSlug() != null ? command.getSlug() : generateSlug(command.getTitle());

        // 카테고리 검증 및 정보 추출
        Category category = categoryRepository.findById(command.getCategoryId())
                .orElseThrow(() -> ResourceNotFoundException.category(command.getCategoryId()));

        Post.CategoryInfo categoryInfo = Post.CategoryInfo.builder()
                .id(category.getId())
                .name(category.getName())
                .slug(category.getSlug())
                .build();

        // 태그 검증 및 정보 추출 (배치 조회)
        List<Post.TagInfo> tagInfos = new ArrayList<>();
        if (command.getTagIds() != null && !command.getTagIds().isEmpty()) {
            List<Tag> tags = tagRepository.findAllById(command.getTagIds());
            if (tags.size() != command.getTagIds().size()) {
                throw ResourceNotFoundException.tag("일부 태그를 찾을 수 없습니다");
            }
            for (Tag tag : tags) {
                tagInfos.add(Post.TagInfo.builder()
                        .id(tag.getId())
                        .name(tag.getName())
                        .build());
            }
        }

        // 작성자 정보 추출 (UserQueryPort 사용)
        UserInfo userInfo = userQueryPort.getUserById(userId);

        Post.AuthorInfo authorInfo = Post.AuthorInfo.builder()
                .id(userInfo.id())
                .name(userInfo.displayName())
                .build();

        // excerpt 자동 생성 (없는 경우 content의 앞 200자)
        String excerpt = command.getExcerpt();
        if (excerpt == null || excerpt.isBlank()) {
            excerpt = generateExcerpt(command.getContent());
        }

        // SEO 정보 생성
        Post.SeoInfo seoInfo = Post.SeoInfo.builder()
                .metaTitle(command.getMetaTitle() != null ? command.getMetaTitle() : command.getTitle())
                .metaDescription(command.getMetaDescription() != null ? command.getMetaDescription() : excerpt)
                .keywords(command.getKeywords())
                .build();

        // Post 생성
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
                .seo(seoInfo)
                .publishedAt(command.getStatus() == Post.Status.PUBLISHED ? LocalDateTime.now() : null)
                .build();

        Post saved;
        try {
            saved = postRepository.save(post);
        } catch (DuplicateKeyException e) {
            throw DuplicateResourceException.slug(slug);
        }

        // postCount 업데이트
        categoryRepository.incrementPostCount(categoryInfo.getId());
        for (Post.TagInfo tagInfo : tagInfos) {
            tagRepository.incrementPostCount(tagInfo.getId());
        }

        return saved;
    }

    /**
     * 포스트 수정 (부분 업데이트)
     */
    @Transactional
    public Post update(String id, PostUpdateCommand command) {
        Post post = findById(id);

        // 제목 수정
        if (command.getTitle() != null) {
            post.setTitle(command.getTitle());
        }

        // 슬러그 수정 (중복 체크)
        if (command.getSlug() != null && !command.getSlug().equals(post.getSlug())) {
            if (postRepository.findBySlug(command.getSlug()).isPresent()) {
                throw DuplicateResourceException.slug(command.getSlug());
            }
            post.setSlug(command.getSlug());
        }

        // 내용 수정
        if (command.getContent() != null) {
            post.setContent(command.getContent());
        }

        // excerpt 수정
        if (command.getExcerpt() != null) {
            post.setExcerpt(command.getExcerpt());
        }

        // 커버 이미지 수정
        if (command.getCoverImage() != null) {
            post.setCoverImage(command.getCoverImage());
        }

        // 카테고리 수정
        if (command.getCategoryId() != null) {
            Category category = categoryRepository.findById(command.getCategoryId())
                    .orElseThrow(() -> ResourceNotFoundException.category(command.getCategoryId()));

            post.setCategory(Post.CategoryInfo.builder()
                    .id(category.getId())
                    .name(category.getName())
                    .slug(category.getSlug())
                    .build());
        }

        // 태그 수정 (배치 조회)
        if (command.getTagIds() != null) {
            List<Post.TagInfo> tagInfos = new ArrayList<>();
            if (!command.getTagIds().isEmpty()) {
                List<Tag> tags = tagRepository.findAllById(command.getTagIds());
                for (Tag tag : tags) {
                    tagInfos.add(Post.TagInfo.builder()
                            .id(tag.getId())
                            .name(tag.getName())
                            .build());
                }
            }
            post.setTags(tagInfos);
        }

        // 상태 수정 (PUBLISHED로 변경 시 publishedAt 설정)
        if (command.getStatus() != null) {
            Post.Status oldStatus = post.getStatus();
            post.setStatus(command.getStatus());

            if (oldStatus != Post.Status.PUBLISHED && command.getStatus() == Post.Status.PUBLISHED) {
                post.setPublishedAt(LocalDateTime.now());
            }
        }

        // featured 수정
        if (command.getFeatured() != null) {
            post.setFeatured(command.getFeatured());
        }

        // SEO 정보 수정
        if (command.getMetaTitle() != null || command.getMetaDescription() != null || command.getKeywords() != null) {
            Post.SeoInfo currentSeo = post.getSeo() != null ? post.getSeo() : new Post.SeoInfo();
            post.setSeo(Post.SeoInfo.builder()
                    .metaTitle(command.getMetaTitle() != null ? command.getMetaTitle() : currentSeo.getMetaTitle())
                    .metaDescription(command.getMetaDescription() != null ? command.getMetaDescription() : currentSeo.getMetaDescription())
                    .keywords(command.getKeywords() != null ? command.getKeywords() : currentSeo.getKeywords())
                    .build());
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

        // postCount 감소
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

    /**
     * 슬러그 생성 (제목 -> kebab-case)
     */
    private String generateSlug(String title) {
        return SlugUtils.generate(title);
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
