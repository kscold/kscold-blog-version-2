package com.kscold.blog.guestbook.adapter.in.web.dto;

import com.kscold.blog.guestbook.domain.model.GuestbookEntry;
import com.kscold.blog.identity.domain.model.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GuestbookEntryResponse {

    private String id;
    private String authorName;
    private Boolean isAdmin;
    private Boolean canDelete;
    private String content;
    private LocalDateTime createdAt;

    public static GuestbookEntryResponse from(GuestbookEntry entry, String currentUserId, boolean currentUserIsAdmin) {
        boolean canDelete = currentUserId != null
                && (currentUserIsAdmin || currentUserId.equals(entry.getUserId()));

        return GuestbookEntryResponse.builder()
                .id(entry.getId())
                .authorName(entry.getAuthorName())
                .isAdmin(entry.getAuthorRole() == User.Role.ADMIN)
                .canDelete(canDelete)
                .content(entry.getContent())
                .createdAt(entry.getCreatedAt())
                .build();
    }
}
