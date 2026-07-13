package com.kscold.blog.vault.agent.application.dto;

import java.util.List;

public record ChatHistoryResponse(String sessionId, List<ChatHistoryMessage> messages) {}
