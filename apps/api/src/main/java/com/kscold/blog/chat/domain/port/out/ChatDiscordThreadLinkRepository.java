package com.kscold.blog.chat.domain.port.out;

import com.kscold.blog.chat.domain.model.ChatDiscordThreadLink;

import java.util.Optional;

public interface ChatDiscordThreadLinkRepository {

    Optional<ChatDiscordThreadLink> findByRoomId(String roomId);

    Optional<ChatDiscordThreadLink> findByThreadId(String threadId);

    ChatDiscordThreadLink save(ChatDiscordThreadLink link);
}
