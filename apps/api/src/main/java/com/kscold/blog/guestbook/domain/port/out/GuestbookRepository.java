package com.kscold.blog.guestbook.domain.port.out;

import com.kscold.blog.guestbook.domain.model.GuestbookEntry;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface GuestbookRepository {

    GuestbookEntry save(GuestbookEntry entry);

    Page<GuestbookEntry> findAll(Pageable pageable);

    Optional<GuestbookEntry> findById(String id);

    void delete(GuestbookEntry entry);
}
