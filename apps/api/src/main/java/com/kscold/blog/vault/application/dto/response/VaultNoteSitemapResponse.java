package com.kscold.blog.vault.application.dto.response;

/** 검색엔진 사이트맵이 색인 대상을 고르는 데 필요한 최소 Vault 노트 정보. */
public record VaultNoteSitemapResponse(String slug, int contentLength) {}
