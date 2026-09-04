package com.kscold.blog.vault.application.dto.response;

/** Vault 상세의 Linked Mentions 카드에 필요한 최소 응답. */
public record VaultNoteBacklinkResponse(String id, String title, String slug, String excerpt) {}
