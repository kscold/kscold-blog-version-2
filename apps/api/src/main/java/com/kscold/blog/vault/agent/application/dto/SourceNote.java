package com.kscold.blog.vault.agent.application.dto;

public record SourceNote(
        String id, String title, String slug, double score, String type, String path) {}
