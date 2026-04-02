package com.kscold.blog.guestbook.domain.port.out;

import com.kscold.blog.guestbook.domain.model.GuestbookEntry;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;

public interface GuestbookRepository {

    GuestbookEntry save(GuestbookEntry entry);

    Page<GuestbookEntry> findAll(Pageable pageable);

    Optional<GuestbookEntry> findById(String id);

    void delete(GuestbookEntry entry);
}
