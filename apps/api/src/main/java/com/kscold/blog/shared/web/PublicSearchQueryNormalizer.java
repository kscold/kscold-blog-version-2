package com.kscold.blog.shared.web;

import com.kscold.blog.exception.InvalidRequestException;

/** 공개 검색 API가 MongoDB에 전달하는 검색어의 공통 경계를 관리한다. */
public final class PublicSearchQueryNormalizer {

    public static final int MAX_LENGTH = 120;

    private PublicSearchQueryNormalizer() {}

    public static String normalize(String query) {
        String normalized = query == null ? "" : query.trim();
        if (normalized.isEmpty()) {
            throw InvalidRequestException.invalidInput("검색어를 입력해 주세요");
        }
        if (normalized.length() > MAX_LENGTH) {
            throw InvalidRequestException.invalidInput("검색어는 " + MAX_LENGTH + "자를 넘길 수 없습니다");
        }
        return normalized;
    }
}
