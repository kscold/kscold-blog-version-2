package com.kscold.blog.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "feed_comments")
public class FeedComment {

    @Id
    private String id;

    @Indexed
    private String feedId;

    private String authorName;

    private String authorPassword;

    private String userId;

    private String content;

    @CreatedDate
    private LocalDateTime createdAt;
}
