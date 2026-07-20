package com.kscold.blog.blog.application.service;

import com.kscold.blog.blog.application.dto.command.PostCreateCommand;
import com.kscold.blog.blog.application.dto.command.PostUpdateCommand;
import com.kscold.blog.blog.application.port.in.PostUseCase;
import com.kscold.blog.blog.domain.model.Post;
import com.kscold.blog.blog.domain.model.Tag;
import com.kscold.blog.blog.domain.port.out.PostRepository;
import com.kscold.blog.blog.domain.port.out.TagRepository;
import com.kscold.blog.exception.DuplicateResourceException;
import com.kscold.blog.exception.ResourceNotFoundException;
import com.kscold.blog.shared.util.SlugUtils;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** 포스트 비즈니스 로직 애플리케이션 서비스 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PostApplicationService implements PostUseCase {

    private final PostRepository postRepository;
    private final PostDraftService postDraftService;
    private final PostReferenceService postReferenceService;
    private final TagRepository tagRepository;

    private static final String TAG_PUBLIC = "공개";
    private static final String TAG_PRIVATE = "비공개";

    /** 포스트 생성 */
    @Transactional
    public Post create(PostCreateCommand command, String userId) {
        String slug =
                command.getSlug() != null ? command.getSlug() : generateSlug(command.getTitle());
        Post.CategoryInfo categoryInfo =
                postReferenceService.resolveCategory(command.getCategoryId());
        List<Post.TagInfo> tagInfos = postReferenceService.resolveTags(command.getTagIds());
        Post.AuthorInfo authorInfo = postReferenceService.resolveAuthor(userId);
        Post post = postDraftService.createDraft(command, slug, categoryInfo, tagInfos, authorInfo);

        Post saved = saveWithSlugCheck(post, slug);
        postReferenceService.incrementPostCounts(categoryInfo, tagInfos);
        return saved;
    }

    /** 포스트 수정 (부분 업데이트) */
    @Transactional
    public Post update(String id, PostUpdateCommand command) {
        Post post = findById(id);
        Post.CategoryInfo categoryInfo =
                command.getCategoryId() != null
                        ? postReferenceService.resolveCategory(command.getCategoryId())
                        : null;
        List<Post.TagInfo> tagInfos =
                command.getTagIds() != null
                        ? postReferenceService.resolveTags(command.getTagIds())
                        : null;

        if (command.getSlug() != null && !command.getSlug().equals(post.getSlug())) {
            if (postRepository.findBySlug(command.getSlug()).isPresent()) {
                throw DuplicateResourceException.slug(command.getSlug());
            }
            post.setSlug(command.getSlug());
        }

        // publicOverride 변경 시 공개/비공개 태그 자동 스왑
        if (command.getPublicOverride() != null) {
            Boolean prev = post.getPublicOverride();
            boolean nowPublic = command.getPublicOverride();
            boolean wasPublic = Boolean.TRUE.equals(prev);
            if (nowPublic != wasPublic) {
                // tagIds를 직접 지정하지 않은 경우에만 자동 스왑
                if (command.getTagIds() == null) {
                    List<Post.TagInfo> swapped = swapVisibilityTag(post.getTags(), nowPublic);
                    tagInfos = swapped;
                }
            }
        }

        postDraftService.applyUpdate(post, command, categoryInfo, tagInfos);

        return postRepository.save(post);
    }

    /** 태그 목록에서 공개↔비공개 태그를 스왑하고 카운트를 보정함. */
    private List<Post.TagInfo> swapVisibilityTag(List<Post.TagInfo> current, boolean nowPublic) {
        String addName = nowPublic ? TAG_PUBLIC : TAG_PRIVATE;
        String removeName = nowPublic ? TAG_PRIVATE : TAG_PUBLIC;

        List<Post.TagInfo> result = new ArrayList<>();
        boolean hadRemove = false;
        boolean hasAdd = false;

        for (Post.TagInfo t : current) {
            if (removeName.equals(t.getName())) {
                hadRemove = true; // 기존 태그 제거 (목록에 넣지 않음)
            } else {
                if (addName.equals(t.getName())) hasAdd = true;
                result.add(t);
            }
        }

        // 추가 태그 삽입
        if (!hasAdd) {
            Optional<Tag> addTag = tagRepository.findByName(addName);
            addTag.ifPresent(
                    tag ->
                            result.add(
                                    Post.TagInfo.builder()
                                            .id(tag.getId())
                                            .name(tag.getName())
                                            .build()));
        }

        // 카운트 보정
        if (hadRemove) {
            tagRepository
                    .findByName(removeName)
                    .ifPresent(tag -> tagRepository.decrementPostCount(tag.getId()));
        }
        if (!hasAdd) {
            tagRepository
                    .findByName(addName)
                    .ifPresent(tag -> tagRepository.incrementPostCount(tag.getId()));
        }

        return result;
    }

    /** 포스트 삭제 (Soft Delete - ARCHIVED 상태로 변경) */
    @Transactional
    public void delete(String id) {
        Post post = findById(id);
        post.setStatus(Post.Status.ARCHIVED);
        postRepository.save(post);
        postReferenceService.decrementPostCounts(post.getCategory(), post.getTags());
    }

    /** 내부 조회용 (조회수 미증가) */
    private Post findById(String id) {
        return postRepository.findById(id).orElseThrow(() -> ResourceNotFoundException.post(id));
    }

    /** 포스트 조회 (ID) - 조회수 증가는 controller에서 IP 기반으로 별도 집계 */
    public Post getById(String id) {
        return findById(id);
    }

    /** 포스트 조회 (Slug) */
    public Post getBySlug(String slug) {
        return postRepository
                .findBySlug(slug)
                .orElseThrow(() -> ResourceNotFoundException.postBySlug(slug));
    }

    /** 전체 포스트 조회 (페이지네이션) */
    public Page<Post> getAll(Pageable pageable) {
        return postRepository.findByStatus(Post.Status.PUBLISHED, pageable);
    }

    /** 관리자용 전체 포스트 조회 (모든 상태) */
    public Page<Post> getAllAdmin(Pageable pageable) {
        return postRepository.findAll(pageable);
    }

    /** 최근 1달 기준 조회수 상위 포스트 조회 (공개 포스트) 1달 이내 결과가 limit에 미치지 못하면 전체 기간으로 fallback */
    public List<Post> getFeatured(Pageable pageable) {
        int limit = pageable.getPageSize();
        LocalDateTime since = LocalDateTime.now().minusDays(30);

        // 최근 1달 이내 posts 중 views 상위
        List<Post> all = postRepository.findAllPublished(pageable);
        List<Post> recent =
                all.stream()
                        .filter(
                                p ->
                                        p.getPublishedAt() != null
                                                && p.getPublishedAt().isAfter(since))
                        .limit(limit)
                        .toList();

        // 1달 이내 결과 부족하면 전체 기간 views 상위
        return recent.size() >= limit ? recent : all;
    }

    /** 카테고리별 포스트 조회 */
    public Page<Post> getByCategory(String categoryId, Pageable pageable) {
        return postRepository.findByCategoryIdAndPublished(categoryId, pageable);
    }

    /** 태그별 포스트 조회 */
    public Page<Post> getByTag(String tagId, Pageable pageable) {
        return postRepository.findByTagIdAndPublished(tagId, pageable);
    }

    /** 포스트 검색 (제목 + 내용 전문 검색) */
    public Page<Post> search(String keyword, Pageable pageable) {
        return postRepository.searchByText(keyword, pageable);
    }

    /** 슬러그 존재 여부 확인 */
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
