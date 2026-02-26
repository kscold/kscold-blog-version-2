package com.kscold.blog.util;

/**
 * 슬러그 생성 유틸리티
 * Post, Category, Tag에서 공통으로 사용
 */
public final class SlugUtils {

    private SlugUtils() {
    }

    /**
     * 이름/제목을 kebab-case 슬러그로 변환
     * 영문, 숫자, 한글, 하이픈만 허용
     */
    public static String generate(String name) {
        if (name == null || name.isBlank()) {
            return "";
        }
        return name.toLowerCase()
                .replaceAll("[^a-z0-9가-힣\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-")
                .replaceAll("^-|-$", "")
                .trim();
    }
}
