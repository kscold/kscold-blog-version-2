package com.kscold.blog.guestbook.domain.model;

import com.kscold.blog.identity.domain.model.User;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "guestbook_entries")
public class GuestbookEntry {

    @Id private String id;

    private String authorName;

    private String userId;

    private User.Role authorRole;

    private String content;

    /** 블로그 주인(admin)이 남긴 답글. 아직 답글이 없으면 null. */
    private GuestbookReply reply;

    @CreatedDate private LocalDateTime createdAt;

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GuestbookReply {
        private String content;
        private LocalDateTime repliedAt;
    }
}
