package com.kscold.blog.chat.adapter.out.persistence;

import com.kscold.blog.chat.domain.model.ChatDiscordThreadLink;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface MongoChatDiscordThreadLinkRepository extends MongoRepository<ChatDiscordThreadLink, String> {

    Optional<ChatDiscordThreadLink> findByRoomId(String roomId);

    Optional<ChatDiscordThreadLink> findByThreadId(String threadId);
}
