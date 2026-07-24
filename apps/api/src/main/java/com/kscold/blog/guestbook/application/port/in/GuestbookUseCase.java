package com.kscold.blog.guestbook.application.port.in;

import com.kscold.blog.guestbook.application.dto.command.GuestbookEntryCreateCommand;
import com.kscold.blog.guestbook.application.dto.command.GuestbookReplyCommand;
import com.kscold.blog.guestbook.domain.model.GuestbookEntry;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface GuestbookUseCase {

    Page<GuestbookEntry> getEntries(Pageable pageable);

    GuestbookEntry create(GuestbookEntryCreateCommand command, String userId);

    void delete(String entryId, String currentUserId);

    /** 방명록에 블로그 주인(admin)이 답글을 남김. admin 이 아니면 거부함. */
    GuestbookEntry reply(String entryId, GuestbookReplyCommand command, String adminUserId);
}
