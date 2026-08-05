package com.kscold.blog.stackshare.domain.model;

import java.util.Map;

public record StackShareMessage(
        String phoneNumber, String templateId, Map<String, String> variables) {}
