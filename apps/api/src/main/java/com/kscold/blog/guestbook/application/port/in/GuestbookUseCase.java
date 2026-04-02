package com.kscold.blog.guestbook.application.port.in;

import com.kscold.blog.guestbook.application.dto.GuestbookEntryCreateCommand;
import com.kscold.blog.guestbook.domain.model.GuestbookEntry;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface GuestbookUseCase {

    Page<GuestbookEntry> getEntries(Pageable pageable);

    GuestbookEntry create(GuestbookEntryCreateCommand command, String userId);

    void delete(String entryId, String currentUserId);
}
