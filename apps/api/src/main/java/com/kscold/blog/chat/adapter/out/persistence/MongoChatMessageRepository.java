package com.kscold.blog.chat.adapter.out.persistence;

import com.kscold.blog.chat.domain.model.ChatMessage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface MongoChatMessageRepository extends MongoRepository<ChatMessage, String> {

    List<ChatMessage> findByOrderByTimestampDesc(Pageable pageable);

    Page<ChatMessage> findAll(Pageable pageable);
}
