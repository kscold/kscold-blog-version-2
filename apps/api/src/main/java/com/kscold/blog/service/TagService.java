package com.kscold.blog.service;

import com.kscold.blog.dto.request.TagRequest;
import com.kscold.blog.exception.DuplicateResourceException;
import com.kscold.blog.exception.ResourceNotFoundException;
import com.kscold.blog.model.Tag;
import com.kscold.blog.repository.TagRepository;
import com.kscold.blog.util.SlugUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 태그 비즈니스 로직 서비스
 */
@Service
@RequiredArgsConstructor
public class TagService {

    private final TagRepository tagRepository;

    /**
     * 태그 생성
     * - 슬러그 자동 생성
     * - 중복 체크 (name, slug)
     */
    @Transactional
    public Tag create(TagRequest request) {
        // 이름 중복 체크
        if (tagRepository.findByName(request.getName()).isPresent()) {
            throw DuplicateResourceException.slug(request.getName());
        }

        // 슬러그 생성 및 중복 체크
        String slug = request.getSlug() != null ? request.getSlug() : SlugUtils.generate(request.getName());
        if (tagRepository.findBySlug(slug).isPresent()) {
            throw DuplicateResourceException.slug(slug);
        }

        Tag tag = Tag.builder()
                .name(request.getName())
                .slug(slug)
                .build();

        return tagRepository.save(tag);
    }

    /**
     * 태그 수정
     */
    @Transactional
    public Tag update(String id, TagRequest request) {
        Tag tag = getById(id);

        // 이름 수정 (중복 체크)
        if (!tag.getName().equals(request.getName())) {
            if (tagRepository.findByName(request.getName()).isPresent()) {
                throw DuplicateResourceException.slug(request.getName());
            }
            tag.setName(request.getName());
        }

        // 슬러그 수정 (중복 체크)
        if (request.getSlug() != null && !tag.getSlug().equals(request.getSlug())) {
            if (tagRepository.findBySlug(request.getSlug()).isPresent()) {
                throw DuplicateResourceException.slug(request.getSlug());
            }
            tag.setSlug(request.getSlug());
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
     * 태그의 postCount 증가
     */
    @Transactional
    public void incrementPostCount(String tagId) {
        Tag tag = getById(tagId);
        tag.setPostCount(tag.getPostCount() + 1);
        tagRepository.save(tag);
    }

    /**
     * 태그의 postCount 감소
     */
    @Transactional
    public void decrementPostCount(String tagId) {
        Tag tag = getById(tagId);
        tag.setPostCount(Math.max(0, tag.getPostCount() - 1));
        tagRepository.save(tag);
    }

    /**
     * 태그명으로 조회하거나, 없으면 자동 생성
     */
    @Transactional
    public Tag findOrCreateByName(String name) {
        return tagRepository.findByName(name)
                .orElseGet(() -> {
                    String slug = SlugUtils.generate(name);
                    String uniqueSlug = slug;
                    int counter = 1;
                    while (tagRepository.findBySlug(uniqueSlug).isPresent()) {
                        uniqueSlug = slug + "-" + counter++;
                    }
                    Tag tag = Tag.builder()
                            .name(name)
                            .slug(uniqueSlug)
                            .build();
                    return tagRepository.save(tag);
                });
    }
}
