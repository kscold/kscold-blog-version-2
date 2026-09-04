package com.kscold.blog.blog.application.service;

import com.kscold.blog.blog.application.dto.command.TagCommand;
import com.kscold.blog.blog.application.port.in.TagUseCase;
import com.kscold.blog.blog.config.InvalidateBlogCatalogCaches;
import com.kscold.blog.blog.domain.model.Post;
import com.kscold.blog.blog.domain.model.Tag;
import com.kscold.blog.blog.domain.port.out.PostRepository;
import com.kscold.blog.blog.domain.port.out.TagRepository;
import com.kscold.blog.exception.DuplicateResourceException;
import com.kscold.blog.exception.ResourceNotFoundException;
import com.kscold.blog.shared.util.SlugUtils;
import java.util.List;
import java.util.Objects;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** 태그 비즈니스 로직 애플리케이션 서비스 */
@Slf4j
@Service
@RequiredArgsConstructor
public class TagApplicationService implements TagUseCase {

    private final TagRepository tagRepository;
    private final PostRepository postRepository;

    /** 태그 생성 - 슬러그 자동 생성 - 중복 체크 (name, slug) */
    @Transactional
    @InvalidateBlogCatalogCaches
    public Tag create(TagCommand command) {
        String slug =
                command.getSlug() != null
                        ? command.getSlug()
                        : SlugUtils.generate(command.getName());

        Tag tag = Tag.builder().name(command.getName()).slug(slug).build();

        try {
            return tagRepository.save(tag);
        } catch (DuplicateKeyException e) {
            throw DuplicateResourceException.slug(slug);
        }
    }

    /** 태그 수정 */
    @Transactional
    @InvalidateBlogCatalogCaches
    public Tag update(String id, TagCommand command) {
        Tag tag = getById(id);
        boolean isReferenceChanged =
                !tag.getName().equals(command.getName())
                        || (command.getSlug() != null
                                && !Objects.equals(tag.getSlug(), command.getSlug()));

        // 이름 수정 (중복 체크)
        if (!tag.getName().equals(command.getName())) {
            if (tagRepository.findByName(command.getName()).isPresent()) {
                throw DuplicateResourceException.slug(command.getName());
            }
            tag.setName(command.getName());
        }

        // 슬러그 수정 (중복 체크)
        if (command.getSlug() != null && !tag.getSlug().equals(command.getSlug())) {
            if (tagRepository.findBySlug(command.getSlug()).isPresent()) {
                throw DuplicateResourceException.slug(command.getSlug());
            }
            tag.setSlug(command.getSlug());
        }

        // 빈 문자열은 분류 해제로 본다. null 은 "건드리지 않음" 이라 구분이 필요하다.
        if (command.getCategoryId() != null) {
            tag.setCategoryId(command.getCategoryId().isBlank() ? null : command.getCategoryId());
        }

        Tag saved = tagRepository.save(tag);
        if (isReferenceChanged) {
            postRepository.updateTagReference(
                    Post.TagInfo.builder()
                            .id(saved.getId())
                            .name(saved.getName())
                            .slug(saved.getSlug())
                            .build());
        }
        return saved;
    }

    /** 태그 삭제 */
    @Transactional
    @InvalidateBlogCatalogCaches
    public void delete(String id) {
        Tag tag = getById(id);
        tagRepository.delete(tag);
    }

    /** 태그 조회 (ID) */
    public Tag getById(String id) {
        return tagRepository.findById(id).orElseThrow(() -> ResourceNotFoundException.tag(id));
    }

    /** 태그 조회 (Slug) */
    public Tag getBySlug(String slug) {
        return tagRepository
                .findBySlug(slug)
                .orElseThrow(() -> ResourceNotFoundException.tag(slug));
    }

    /** 전체 태그 조회 */
    public List<Tag> getAll() {
        return tagRepository.findAll();
    }

    /** 태그의 postCount 원자적 증가 */
    @InvalidateBlogCatalogCaches
    public void incrementPostCount(String tagId) {
        tagRepository.incrementPostCount(tagId);
    }

    /** 태그의 postCount 원자적 감소 (최소 0) */
    @InvalidateBlogCatalogCaches
    public void decrementPostCount(String tagId) {
        tagRepository.decrementPostCount(tagId);
    }

    /** 태그명으로 조회하거나, 없으면 자동 생성 */
    @Transactional
    @InvalidateBlogCatalogCaches
    public Tag findOrCreateByName(String name) {
        return tagRepository
                .findByName(name)
                .orElseGet(
                        () -> {
                            String slug = SlugUtils.generate(name);
                            Tag tag = Tag.builder().name(name).slug(slug).build();
                            try {
                                return tagRepository.save(tag);
                            } catch (DuplicateKeyException e) {
                                // 동시에 같은 이름/슬러그로 생성된 경우 재조회
                                return tagRepository
                                        .findByName(name)
                                        .orElseThrow(() -> DuplicateResourceException.slug(slug));
                            }
                        });
    }
}
