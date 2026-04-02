package com.kscold.blog.guestbook.adapter.out.persistence;

import com.kscold.blog.guestbook.domain.model.GuestbookEntry;
import com.kscold.blog.guestbook.domain.port.out.GuestbookRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import java.util.Optional;

@SuppressWarnings("null")
@Component
@RequiredArgsConstructor
public class GuestbookRepositoryAdapter implements GuestbookRepository {

    private final MongoGuestbookRepository mongoGuestbookRepository;

    @Override
    public GuestbookEntry save(GuestbookEntry entry) {
        return mongoGuestbookRepository.save(entry);
    }

    @Override
    public Page<GuestbookEntry> findAll(Pageable pageable) {
        return mongoGuestbookRepository.findAll(pageable);
    }

    @Override
    public Optional<GuestbookEntry> findById(String id) {
        return mongoGuestbookRepository.findById(id);
    }

    @Override
    public void delete(GuestbookEntry entry) {
        mongoGuestbookRepository.delete(entry);
    }
}
