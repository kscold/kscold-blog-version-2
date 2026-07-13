package com.kscold.blog.vault.agent.application.dto;

public record ReindexResponse(int totalNotes, int indexedNotes, int skippedNotes) {}
