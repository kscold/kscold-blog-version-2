package com.kscold.blog.service;

import com.kscold.blog.dto.request.CategoryCreateRequest;
import com.kscold.blog.dto.request.CategoryUpdateRequest;
import com.kscold.blog.exception.InvalidRequestException;
import com.kscold.blog.exception.ResourceNotFoundException;
import com.kscold.blog.model.Category;
import com.kscold.blog.repository.CategoryRepository;
import com.kscold.blog.util.SlugUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private static final int MAX_DEPTH = 4; // 0-4 = 5단계

    /**
     * 카테고리 생성 (DTO에서 엔티티 변환 포함)
     */
    @Transactional
    public Category create(CategoryCreateRequest request) {
        String slug = request.getSlug() != null ? request.getSlug() : SlugUtils.generate(request.getName());

        Category category = Category.builder()
                .name(request.getName())
                .slug(slug)
                .description(request.getDescription())
                .parent(request.getParent())
                .order(request.getOrder() != null ? request.getOrder() : 0)
                .icon(request.getIcon())
                .color(request.getColor())
                .build();

        // 부모가 있는 경우
        if (category.getParent() != null) {
            Category parent = categoryRepository.findById(category.getParent())
                    .orElseThrow(() -> ResourceNotFoundException.category(category.getParent()));

            if (parent.getDepth() >= MAX_DEPTH) {
                throw InvalidRequestException.invalidInput("카테고리는 최대 5단계까지만 생성할 수 있습니다");
            }

            List<String> ancestors = new ArrayList<>(parent.getAncestors());
            ancestors.add(parent.getId());
            category.setAncestors(ancestors);
            category.setDepth(parent.getDepth() + 1);
        } else {
            category.setAncestors(new ArrayList<>());
            category.setDepth(0);
        }

        return categoryRepository.save(category);
    }

    /**
     * 전체 카테고리 조회 (flat 리스트 - 트리 구조는 CategoryResponse에서 처리)
     */
    public List<Category> getAll() {
        return categoryRepository.findAll();
    }

    public List<Category> getByParent(String parentId) {
        if (parentId == null) {
            return categoryRepository.findByParentIsNull();
        }
        return categoryRepository.findByParentOrderByOrderAsc(parentId);
    }

    public Category getById(String id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.category(id));
    }

    public Category getBySlug(String slug) {
        return categoryRepository.findBySlug(slug)
                .orElseThrow(() -> ResourceNotFoundException.category(slug));
    }

    /**
     * 카테고리 수정 (null 필드는 기존 값 유지)
     */
    @Transactional
    public Category update(String id, CategoryUpdateRequest request) {
        Category category = getById(id);

        if (request.getName() != null) {
            category.setName(request.getName());
        }
        if (request.getSlug() != null) {
            category.setSlug(request.getSlug());
        }
        if (request.getDescription() != null) {
            category.setDescription(request.getDescription());
        }
        if (request.getOrder() != null) {
            category.setOrder(request.getOrder());
        }
        if (request.getIcon() != null) {
            category.setIcon(request.getIcon());
        }
        if (request.getColor() != null) {
            category.setColor(request.getColor());
        }

        return categoryRepository.save(category);
    }

    @Transactional
    public void delete(String id) {
        Category category = getById(id);

        List<Category> children = categoryRepository.findByParent(id);
        if (!children.isEmpty()) {
            throw InvalidRequestException.invalidInput("하위 카테고리가 있는 카테고리는 삭제할 수 없습니다");
        }

        categoryRepository.delete(category);
    }

    @Transactional
    public Category move(String id, String newParentId) {
        Category category = getById(id);
        Category newParent = newParentId != null ? getById(newParentId) : null;

        if (newParent != null && newParent.getAncestors().contains(id)) {
            throw InvalidRequestException.invalidInput("카테고리를 자신의 하위 카테고리로 이동할 수 없습니다");
        }

        if (newParent != null && newParent.getDepth() >= MAX_DEPTH) {
            throw InvalidRequestException.invalidInput("카테고리는 최대 5단계까지만 생성할 수 있습니다");
        }

        category.setParent(newParentId);

        if (newParent != null) {
            List<String> ancestors = new ArrayList<>(newParent.getAncestors());
            ancestors.add(newParent.getId());
            category.setAncestors(ancestors);
            category.setDepth(newParent.getDepth() + 1);
        } else {
            category.setAncestors(new ArrayList<>());
            category.setDepth(0);
        }

        updateChildrenAncestors(category);

        return categoryRepository.save(category);
    }

    /**
     * 카테고리의 postCount 증가
     */
    @Transactional
    public void incrementPostCount(String categoryId) {
        Category category = getById(categoryId);
        category.setPostCount(category.getPostCount() + 1);
        categoryRepository.save(category);
    }

    /**
     * 카테고리의 postCount 감소
     */
    @Transactional
    public void decrementPostCount(String categoryId) {
        Category category = getById(categoryId);
        category.setPostCount(Math.max(0, category.getPostCount() - 1));
        categoryRepository.save(category);
    }

    private void updateChildrenAncestors(Category parent) {
        List<Category> children = categoryRepository.findByParent(parent.getId());

        for (Category child : children) {
            List<String> ancestors = new ArrayList<>(parent.getAncestors());
            ancestors.add(parent.getId());
            child.setAncestors(ancestors);
            child.setDepth(parent.getDepth() + 1);

            categoryRepository.save(child);
            updateChildrenAncestors(child);
        }
    }
}
