package com.kscold.blog.chat.adapter.out.persistence;

import com.kscold.blog.chat.domain.model.ChatDiscordThreadLink;
import com.kscold.blog.chat.domain.port.out.ChatDiscordThreadLinkRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
public class ChatDiscordThreadLinkRepositoryAdapter implements ChatDiscordThreadLinkRepository {

    private final MongoChatDiscordThreadLinkRepository repository;

    @Override
    public Optional<ChatDiscordThreadLink> findByRoomId(String roomId) {
        return repository.findByRoomId(roomId);
    }

    @Override
    public Optional<ChatDiscordThreadLink> findByThreadId(String threadId) {
        return repository.findByThreadId(threadId);
    }

    @Override
    public ChatDiscordThreadLink save(ChatDiscordThreadLink link) {
        return repository.save(link);
    }
}
