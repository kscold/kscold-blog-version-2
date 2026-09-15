package com.kscold.blog.blog.domain.model;

/** 이전글은 더 오래된 글, 다음글은 더 최근에 발행한 공개 글이다. */
public record PostNavigation(Entry previous, Entry next) {
    public record Entry(String title, String slug, String categorySlug) {}
}
