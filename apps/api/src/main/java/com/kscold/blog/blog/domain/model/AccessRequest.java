package com.kscold.blog.blog.domain.model;

import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "access_requests")
@CompoundIndex(name = "user_category_idx", def = "{'userId': 1, 'categoryId': 1}", unique = true)
public class AccessRequest {
    @Id
    private String id;

    private String userId;
    private String username;
    private String categoryId;
    private String categoryName;

    @Builder.Default
    private Status status = Status.PENDING;

    private String message; // 요청 사유 (선택)

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    public enum Status {
        PENDING, APPROVED, REJECTED
    }
}
