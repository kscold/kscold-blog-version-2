package com.kscold.blog.shared.web;

import com.kscold.blog.exception.InvalidRequestException;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

/** 목록 API가 과도한 문서를 한 요청에 읽지 않도록 페이지 입력을 정규화한다. */
public final class BoundedPageRequestFactory {

    public static final int MAX_PAGE_INDEX = 499;
    public static final int MAX_PAGE_SIZE = 100;

    private BoundedPageRequestFactory() {}

    public static Pageable of(int page, int size) {
        return PageRequest.of(normalizePage(page), limit(size));
    }

    public static Pageable of(int page, int size, Sort sort) {
        return PageRequest.of(normalizePage(page), limit(size), sort);
    }

    public static int limit(int size) {
        return Math.min(Math.max(size, 1), MAX_PAGE_SIZE);
    }

    private static int normalizePage(int page) {
        if (page > MAX_PAGE_INDEX) {
            throw InvalidRequestException.invalidInput("페이지 상한을 초과했습니다.");
        }
        return Math.max(page, 0);
    }
}
