package com.kscold.blog.chat.adapter.out.persistence;

import com.kscold.blog.chat.domain.model.ChatMessage;
import com.kscold.blog.chat.domain.port.out.ChatMessageRepository;
import lombok.RequiredArgsConstructor;
import org.bson.Document;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.*;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class ChatMessageRepositoryAdapter implements ChatMessageRepository {

    private final MongoChatMessageRepository mongoChatMessageRepository;
    private final MongoTemplate mongoTemplate;

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

    @Override
    public List<ChatRoomSummary> findAllRooms() {
        Aggregation roomAgg = Aggregation.newAggregation(
                Aggregation.match(Criteria.where("type").is("TEXT")),
                Aggregation.sort(Sort.Direction.DESC, "timestamp"),
                Aggregation.group("roomId")
                        .first("username").as("latestUsername")
                        .first("content").as("lastMessage")
                        .first("timestamp").as("lastTimestamp")
                        .count().as("messageCount"),
                Aggregation.sort(Sort.Direction.DESC, "lastTimestamp")
        );

        Aggregation visitorAgg = Aggregation.newAggregation(
                Aggregation.match(Criteria.where("type").is("TEXT").and("fromAdmin").is(false)),
                Aggregation.sort(Sort.Direction.DESC, "timestamp"),
                Aggregation.group("roomId")
                        .first("username").as("username")
        );

        Map<String, String> visitorUsernames = new LinkedHashMap<>();
        mongoTemplate.aggregate(visitorAgg, "chat_messages", Document.class)
                .getMappedResults()
                .forEach(doc -> visitorUsernames.put(doc.getString("_id"), doc.getString("username")));

        return mongoTemplate.aggregate(roomAgg, "chat_messages", Document.class)
                .getMappedResults().stream()
                .map(doc -> {
                    String roomId = doc.getString("_id");
                    return new ChatRoomSummary(
                            roomId,
                            visitorUsernames.getOrDefault(roomId, doc.getString("latestUsername")),
                            doc.getString("lastMessage"),
                            doc.get("lastTimestamp") != null ? doc.get("lastTimestamp").toString() : "",
                            doc.getInteger("messageCount", 0)
                    );
                })
                .toList();
    }
}
