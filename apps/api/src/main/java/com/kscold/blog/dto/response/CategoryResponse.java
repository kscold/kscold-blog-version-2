package com.kscold.blog.dto.response;

import com.kscold.blog.model.Category;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 카테고리 응답 DTO (트리 구조 지원)
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
    @Builder.Default
    private List<CategoryResponse> children = new ArrayList<>();
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    /**
     * Category 엔티티를 CategoryResponse로 변환 (children 없음)
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
                .children(new ArrayList<>())
                .createdAt(category.getCreatedAt())
                .updatedAt(category.getUpdatedAt())
                .build();
    }

    /**
     * Category 리스트를 flat CategoryResponse 리스트로 변환
     */
    public static List<CategoryResponse> from(List<Category> categories) {
        return categories.stream()
                .map(CategoryResponse::from)
                .toList();
    }

    /**
     * Category 리스트를 트리 구조 CategoryResponse 리스트로 변환
     * 루트 카테고리만 반환하며 children에 하위 카테고리가 재귀적으로 포함됨
     */
    public static List<CategoryResponse> buildTree(List<Category> allCategories) {
        Map<String, CategoryResponse> responseMap = allCategories.stream()
                .collect(Collectors.toMap(Category::getId, CategoryResponse::from));

        List<CategoryResponse> roots = new ArrayList<>();

        for (Category category : allCategories) {
            CategoryResponse response = responseMap.get(category.getId());
            if (category.getParent() == null) {
                roots.add(response);
            } else {
                CategoryResponse parentResponse = responseMap.get(category.getParent());
                if (parentResponse != null) {
                    parentResponse.getChildren().add(response);
                } else {
                    roots.add(response);
                }
            }
        }

        sortChildren(roots);
        return roots;
    }

    private static void sortChildren(List<CategoryResponse> list) {
        list.sort(Comparator.comparingInt(c -> c.getOrder() != null ? c.getOrder() : 0));
        for (CategoryResponse item : list) {
            if (item.getChildren() != null && !item.getChildren().isEmpty()) {
                sortChildren(item.getChildren());
            }
        }
    }
}
