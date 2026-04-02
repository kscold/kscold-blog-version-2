package com.kscold.blog.guestbook.domain.model;

import com.kscold.blog.identity.domain.model.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "guestbook_entries")
public class GuestbookEntry {

    @Id
    private String id;

    private String authorName;

    private String userId;

    private User.Role authorRole;

    private String content;

    @CreatedDate
    private LocalDateTime createdAt;
}
