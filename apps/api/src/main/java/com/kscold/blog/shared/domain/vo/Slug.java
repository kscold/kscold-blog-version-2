package com.kscold.blog.shared.domain.vo;

import java.util.Objects;

/**
 * 슬러그 불변 Value Object
 * URL-safe 식별자로 사용되며, 생성 시 유효성 검증
 */
public final class Slug {

    private final String value;

    private Slug(String value) {
        this.value = value;
    }

    public static Slug of(String value) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("슬러그는 비어있을 수 없습니다");
        }
        String normalized = value.trim().toLowerCase();
        if (!normalized.matches("^[a-z0-9가-힣][a-z0-9가-힣-]*[a-z0-9가-힣]$") && normalized.length() > 1) {
            // 단일 문자는 허용
            if (normalized.length() == 1 && !normalized.matches("^[a-z0-9가-힣]$")) {
                throw new IllegalArgumentException("유효하지 않은 슬러그 형식입니다: " + value);
            }
        }
        return new Slug(normalized);
    }

    /**
     * 유효성 검증 없이 생성 (DB에서 읽어온 값 등)
     */
    public static Slug fromTrusted(String value) {
        return new Slug(value);
    }

    public String getValue() {
        return value;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Slug slug = (Slug) o;
        return Objects.equals(value, slug.value);
    }

    @Override
    public int hashCode() {
        return Objects.hash(value);
    }

    @Override
    public String toString() {
        return value;
    }
}
