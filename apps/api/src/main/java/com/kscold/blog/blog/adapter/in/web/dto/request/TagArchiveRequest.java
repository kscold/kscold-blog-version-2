package com.kscold.blog.blog.adapter.in.web.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class TagArchiveRequest {
    private final Integer page;
    private final Integer size;
    private final String sort;

    public int pageIndex() {
        return page == null ? 0 : page;
    }

    public int pageSize() {
        return size == null ? 10 : size;
    }

    public String sortField() {
        return "popular".equals(sort) ? "views" : "publishedAt";
    }
}
