package com.kscold.blog.chat.adapter.out.persistence;

import com.kscold.blog.chat.domain.model.ChatMessage;
import com.kscold.blog.chat.domain.port.out.ChatMessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Component
@RequiredArgsConstructor
public class ChatMessageRepositoryAdapter implements ChatMessageRepository {

    private final MongoChatMessageRepository mongoChatMessageRepository;

    @Override
    public ChatMessage save(ChatMessage message) {
        return mongoChatMessageRepository.save(message);
    }

    @Override
    public List<ChatMessage> findRecentByRoomId(String roomId, int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        List<ChatMessage> messages = mongoChatMessageRepository.findTopByRoomId(roomId, pageable);
        List<ChatMessage> reversed = new ArrayList<>(messages);
        Collections.reverse(reversed);
        return reversed;
    }

    @Override
    public Page<ChatMessage> findByRoomId(String roomId, Pageable pageable) {
        return mongoChatMessageRepository.findByRoomId(roomId, pageable);
    }

    @Override
    public Page<ChatMessage> findAll(Pageable pageable) {
        return mongoChatMessageRepository.findAll(pageable);
    }
}
