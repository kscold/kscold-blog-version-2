package com.kscold.blog.blog.application.service;

import com.kscold.blog.blog.application.dto.PostCreateCommand;
import com.kscold.blog.blog.application.dto.PostUpdateCommand;
import com.kscold.blog.blog.application.port.in.PostUseCase;
import com.kscold.blog.blog.domain.model.Post;
import com.kscold.blog.blog.domain.port.out.PostRepository;
import com.kscold.blog.exception.DuplicateResourceException;
import com.kscold.blog.exception.ResourceNotFoundException;
import com.kscold.blog.util.SlugUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 포스트 비즈니스 로직 애플리케이션 서비스
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PostApplicationService implements PostUseCase {

    private final PostRepository postRepository;
    private final PostDraftService postDraftService;
    private final PostReferenceService postReferenceService;

    /**
     * 포스트 생성
     */
    @Transactional
    public Post create(PostCreateCommand command, String userId) {
        String slug = command.getSlug() != null ? command.getSlug() : generateSlug(command.getTitle());
        Post.CategoryInfo categoryInfo = postReferenceService.resolveCategory(command.getCategoryId());
        List<Post.TagInfo> tagInfos = postReferenceService.resolveTags(command.getTagIds());
        Post.AuthorInfo authorInfo = postReferenceService.resolveAuthor(userId);
        Post post = postDraftService.createDraft(command, slug, categoryInfo, tagInfos, authorInfo);

        Post saved = saveWithSlugCheck(post, slug);
        postReferenceService.incrementPostCounts(categoryInfo, tagInfos);
        return saved;
    }

    /**
     * 포스트 수정 (부분 업데이트)
     */
    @Transactional
    public Post update(String id, PostUpdateCommand command) {
        Post post = findById(id);
        Post.CategoryInfo categoryInfo = command.getCategoryId() != null ? postReferenceService.resolveCategory(command.getCategoryId()) : null;
        List<Post.TagInfo> tagInfos = command.getTagIds() != null ? postReferenceService.resolveTags(command.getTagIds()) : null;

        if (command.getSlug() != null && !command.getSlug().equals(post.getSlug())) {
            if (postRepository.findBySlug(command.getSlug()).isPresent()) {
                throw DuplicateResourceException.slug(command.getSlug());
            }
            post.setSlug(command.getSlug());
        }

        postDraftService.applyUpdate(post, command, categoryInfo, tagInfos);

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
        postReferenceService.decrementPostCounts(post.getCategory(), post.getTags());
    }

    /**
     * 내부 조회용 (조회수 미증가)
     */
    private Post findById(String id) {
        return postRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.post(id));
    }

    /**
     * 포스트 조회 (ID) - 조회수 증가는 controller에서 IP 기반으로 별도 집계
     */
    public Post getById(String id) {
        return findById(id);
    }

    /**
     * 포스트 조회 (Slug)
     */
    public Post getBySlug(String slug) {
        return postRepository.findBySlug(slug)
                .orElseThrow(() -> ResourceNotFoundException.postBySlug(slug));
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

    private Post saveWithSlugCheck(Post post, String slug) {
        try {
            return postRepository.save(post);
        } catch (DuplicateKeyException e) {
            throw DuplicateResourceException.slug(slug);
        }
    }

    private String generateSlug(String title) {
        return SlugUtils.generate(title);
    }
}
