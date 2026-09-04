package com.kscold.blog.vault.application.dto.response;

/** Vault 본문의 위키 링크를 실제 경로로 바꾸기 위한 최소 제목 인덱스. */
public record VaultNoteTitleResponse(String name, String slug) {}
