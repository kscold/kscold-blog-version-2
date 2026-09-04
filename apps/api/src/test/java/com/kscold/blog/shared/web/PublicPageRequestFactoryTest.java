package com.kscold.blog.shared.web;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

class PublicPageRequestFactoryTest {

    @Test
    void 공개페이지요청은페이지와크기를안전한범위로제한한다() {
        Pageable pageable = PublicPageRequestFactory.of(-3, 10_000);

        assertThat(pageable.getPageNumber()).isZero();
        assertThat(pageable.getPageSize()).isEqualTo(PublicPageRequestFactory.MAX_PAGE_SIZE);
    }

    @Test
    void 공개페이지요청은정렬과최소크기를보존한다() {
        Sort sort = Sort.by(Sort.Direction.DESC, "createdAt");

        Pageable pageable = PublicPageRequestFactory.of(2, 0, sort);

        assertThat(pageable.getPageNumber()).isEqualTo(2);
        assertThat(pageable.getPageSize()).isEqualTo(1);
        assertThat(pageable.getSort()).isEqualTo(sort);
    }

    @Test
    void 목록개수만필요한경우에도같은상한을적용한다() {
        assertThat(PublicPageRequestFactory.limit(1_000))
                .isEqualTo(PublicPageRequestFactory.MAX_PAGE_SIZE);
        assertThat(PublicPageRequestFactory.limit(-1)).isEqualTo(1);
    }
}
