package com.kscold.blog.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "categories")
public class Category {
    @Id
    private String id;

    private String name;

    @Indexed(unique = true)
    private String slug;

    private String description;

    private String parent; // 부모 카테고리 ID (null이면 root)

    @Builder.Default
    private List<String> ancestors = new ArrayList<>(); // 조상 ID 배열 (빠른 조회용)

    @Builder.Default
    private Integer depth = 0; // 0-4 (최대 5단계)

    @Builder.Default
    private Integer order = 0; // 정렬 순서

    private String icon; // 아이콘 이름

    private String color; // hex 색상 코드

    @Builder.Default
    private Integer postCount = 0; // 비정규화된 포스트 수

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
