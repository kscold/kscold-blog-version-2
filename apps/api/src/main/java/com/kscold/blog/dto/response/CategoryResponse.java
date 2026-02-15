package com.kscold.blog.dto.response;

import com.kscold.blog.model.Category;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 카테고리 응답 DTO
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryResponse {

    private String id;
    private String name;
    private String slug;
    private String description;
    private String parent;
    private List<String> ancestors;
    private Integer depth;
    private Integer order;
    private String icon;
    private String color;
    private Integer postCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    /**
     * Category 엔티티를 CategoryResponse로 변환
     */
    public static CategoryResponse from(Category category) {
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .slug(category.getSlug())
                .description(category.getDescription())
                .parent(category.getParent())
                .ancestors(category.getAncestors())
                .depth(category.getDepth())
                .order(category.getOrder())
                .icon(category.getIcon())
                .color(category.getColor())
                .postCount(category.getPostCount())
                .createdAt(category.getCreatedAt())
                .updatedAt(category.getUpdatedAt())
                .build();
    }

    /**
     * Category 리스트를 CategoryResponse 리스트로 변환
     */
    public static List<CategoryResponse> from(List<Category> categories) {
        return categories.stream()
                .map(CategoryResponse::from)
                .toList();
    }
}
