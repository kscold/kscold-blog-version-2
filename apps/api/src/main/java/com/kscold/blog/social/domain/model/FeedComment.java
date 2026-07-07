package com.kscold.blog.social.domain.model;

import com.kscold.blog.identity.domain.model.User;
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
@Document(collection = "feed_comments")
public class FeedComment {

    @Id private String id;

    @Indexed private String feedId;

    private String authorName;

    private String authorPassword;

    private String userId;

    private User.Role authorRole;

    private String content;

    @CreatedDate private LocalDateTime createdAt;
}
