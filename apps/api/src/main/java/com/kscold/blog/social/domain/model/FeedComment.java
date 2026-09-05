package com.kscold.blog.social.domain.model;

import com.kscold.blog.identity.domain.model.User;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.mapping.Document;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "feed_comments")
@CompoundIndexes({
    @CompoundIndex(name = "idx_feed_createdAt", def = "{'feedId': 1, 'createdAt': 1}"),
    @CompoundIndex(name = "idx_feed_userId", def = "{'feedId': 1, 'userId': 1}")
})
public class FeedComment {

    @Id private String id;

    private String feedId;

    private String authorName;

    private String authorPassword;

    private String userId;

    private User.Role authorRole;

    private String content;

    /** 좋아요를 누른 식별자. 로그인 사용자는 userId, 비로그인은 클라이언트 식별자를 넣는다. */
    @Builder.Default private Set<String> likedBy = new HashSet<>();

    @Builder.Default private Integer likesCount = 0;

    @CreatedDate private LocalDateTime createdAt;
}
