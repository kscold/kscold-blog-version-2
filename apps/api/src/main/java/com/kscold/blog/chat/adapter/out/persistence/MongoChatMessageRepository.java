package com.kscold.blog.chat.adapter.out.persistence;

import com.kscold.blog.chat.domain.model.ChatMessage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.List;

public interface MongoChatMessageRepository extends MongoRepository<ChatMessage, String> {

    @Query(value = "{ 'roomId': ?0 }", sort = "{ 'timestamp': -1 }")
    List<ChatMessage> findTopByRoomId(String roomId, Pageable pageable);

    Page<ChatMessage> findByRoomId(String roomId, Pageable pageable);
}
