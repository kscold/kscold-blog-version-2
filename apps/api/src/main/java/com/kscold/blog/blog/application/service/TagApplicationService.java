package com.kscold.blog.blog.application.service;

import com.kscold.blog.blog.application.dto.TagCommand;
import com.kscold.blog.blog.application.port.in.TagUseCase;
import com.kscold.blog.blog.domain.model.Tag;
import com.kscold.blog.blog.domain.port.out.TagRepository;
import com.kscold.blog.exception.DuplicateResourceException;
import com.kscold.blog.exception.ResourceNotFoundException;
import com.kscold.blog.util.SlugUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 태그 비즈니스 로직 애플리케이션 서비스
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class TagApplicationService implements TagUseCase {

    private final TagRepository tagRepository;

    /**
     * 태그 생성
     * - 슬러그 자동 생성
     * - 중복 체크 (name, slug)
     */
    @Transactional
    public Tag create(TagCommand command) {
        String slug = command.getSlug() != null ? command.getSlug() : SlugUtils.generate(command.getName());

        Tag tag = Tag.builder()
                .name(command.getName())
                .slug(slug)
                .build();

        try {
            return tagRepository.save(tag);
        } catch (DuplicateKeyException e) {
            throw DuplicateResourceException.slug(slug);
        }
    }

    /**
     * 태그 수정
     */
    @Transactional
    public Tag update(String id, TagCommand command) {
        Tag tag = getById(id);

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

        return tagRepository.save(tag);
    }

    /**
     * 태그 삭제
     */
    @Transactional
    public void delete(String id) {
        Tag tag = getById(id);
        tagRepository.delete(tag);
    }

    /**
     * 태그 조회 (ID)
     */
    public Tag getById(String id) {
        return tagRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.tag(id));
    }

    /**
     * 태그 조회 (Slug)
     */
    public Tag getBySlug(String slug) {
        return tagRepository.findBySlug(slug)
                .orElseThrow(() -> ResourceNotFoundException.tag(slug));
    }

    /**
     * 전체 태그 조회
     */
    public List<Tag> getAll() {
        return tagRepository.findAll();
    }

    /**
     * 태그의 postCount 원자적 증가
     */
    public void incrementPostCount(String tagId) {
        tagRepository.incrementPostCount(tagId);
    }

    /**
     * 태그의 postCount 원자적 감소 (최소 0)
     */
    public void decrementPostCount(String tagId) {
        tagRepository.decrementPostCount(tagId);
    }

    /**
     * 태그명으로 조회하거나, 없으면 자동 생성
     */
    @Transactional
    public Tag findOrCreateByName(String name) {
        return tagRepository.findByName(name)
                .orElseGet(() -> {
                    String slug = SlugUtils.generate(name);
                    Tag tag = Tag.builder()
                            .name(name)
                            .slug(slug)
                            .build();
                    try {
                        return tagRepository.save(tag);
                    } catch (DuplicateKeyException e) {
                        // 동시에 같은 이름/슬러그로 생성된 경우 재조회
                        return tagRepository.findByName(name)
                                .orElseThrow(() -> DuplicateResourceException.slug(slug));
                    }
                });
    }
}
