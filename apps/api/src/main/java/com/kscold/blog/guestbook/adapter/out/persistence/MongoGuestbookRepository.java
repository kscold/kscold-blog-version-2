package com.kscold.blog.guestbook.adapter.out.persistence;

import com.kscold.blog.guestbook.domain.model.GuestbookEntry;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface MongoGuestbookRepository extends MongoRepository<GuestbookEntry, String> {
}
