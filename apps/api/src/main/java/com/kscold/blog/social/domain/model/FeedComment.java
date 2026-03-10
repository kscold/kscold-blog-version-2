package com.kscold.blog.social.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Getter
@Setter
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
