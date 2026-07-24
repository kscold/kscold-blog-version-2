package com.kscold.blog.guestbook.adapter.in.web.dto.response;

import com.kscold.blog.guestbook.domain.model.GuestbookEntry;
import com.kscold.blog.identity.domain.model.User;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

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
    private ReplyResponse reply;

    public static GuestbookEntryResponse from(
            GuestbookEntry entry, String currentUserId, boolean currentUserIsAdmin) {
        boolean canDelete =
                currentUserId != null
                        && (currentUserIsAdmin || currentUserId.equals(entry.getUserId()));

        return GuestbookEntryResponse.builder()
                .id(entry.getId())
                .authorName(entry.getAuthorName())
                .isAdmin(entry.getAuthorRole() == User.Role.ADMIN)
                .canDelete(canDelete)
                .content(entry.getContent())
                .createdAt(entry.getCreatedAt())
                .reply(entry.getReply() != null ? ReplyResponse.from(entry.getReply()) : null)
                .build();
    }

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReplyResponse {
        private String content;
        private LocalDateTime repliedAt;

        public static ReplyResponse from(GuestbookEntry.GuestbookReply reply) {
            return ReplyResponse.builder()
                    .content(reply.getContent())
                    .repliedAt(reply.getRepliedAt())
                    .build();
        }
    }
}
