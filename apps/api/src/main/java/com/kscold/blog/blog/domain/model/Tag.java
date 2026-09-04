package com.kscold.blog.blog.domain.model;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "tags")
public class Tag {
    @Id private String id;

    @Indexed(unique = true)
    private String name;

    @Indexed(unique = true)
    private String slug;

    @Builder.Default private Integer postCount = 0;

    /** 이 태그를 묶을 블로그 카테고리. 비어 있으면 아직 분류되지 않은 태그다. */
    @Indexed private String categoryId;

    @CreatedDate private LocalDateTime createdAt;
}
