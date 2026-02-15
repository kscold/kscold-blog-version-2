package com.kscold.blog.dto.response;

import com.kscold.blog.model.Tag;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 태그 응답 DTO
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TagResponse {

    private String id;
    private String name;
    private String slug;
    private Integer postCount;
    private LocalDateTime createdAt;

    /**
     * Tag 엔티티를 TagResponse로 변환
     */
    public static TagResponse from(Tag tag) {
        return TagResponse.builder()
                .id(tag.getId())
                .name(tag.getName())
                .slug(tag.getSlug())
                .postCount(tag.getPostCount())
                .createdAt(tag.getCreatedAt())
                .build();
    }

    /**
     * Tag 리스트를 TagResponse 리스트로 변환
     */
    public static List<TagResponse> from(List<Tag> tags) {
        return tags.stream()
                .map(TagResponse::from)
                .toList();
    }
}
