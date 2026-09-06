package com.kscold.blog.shared.web;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.kscold.blog.exception.InvalidRequestException;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

class BoundedPageRequestFactoryTest {

    @Test
    void 페이지와크기를안전한범위로제한한다() {
        Pageable pageable = BoundedPageRequestFactory.of(-3, 10_000);

        assertThat(pageable.getPageNumber()).isZero();
        assertThat(pageable.getPageSize()).isEqualTo(BoundedPageRequestFactory.MAX_PAGE_SIZE);
    }

    @Test
    void 정렬과최소크기를보존한다() {
        Sort sort = Sort.by(Sort.Direction.DESC, "createdAt");

        Pageable pageable = BoundedPageRequestFactory.of(2, 0, sort);

        assertThat(pageable.getPageNumber()).isEqualTo(2);
        assertThat(pageable.getPageSize()).isEqualTo(1);
        assertThat(pageable.getSort()).isEqualTo(sort);
    }

    @Test
    void 목록개수만필요한경우에도같은상한을적용한다() {
        assertThat(BoundedPageRequestFactory.limit(1_000))
                .isEqualTo(BoundedPageRequestFactory.MAX_PAGE_SIZE);
        assertThat(BoundedPageRequestFactory.limit(-1)).isEqualTo(1);
    }

    @Test
    void 최대페이지경계를허용한다() {
        Pageable pageable =
                BoundedPageRequestFactory.of(BoundedPageRequestFactory.MAX_PAGE_INDEX, 10);

        assertThat(pageable.getPageNumber()).isEqualTo(499);
    }

    @Test
    void 최대페이지경계를초과하면거부한다() {
        assertThatThrownBy(() -> BoundedPageRequestFactory.of(500, 10))
                .isInstanceOf(InvalidRequestException.class)
                .hasMessage("페이지 상한을 초과했습니다.");
    }

    @Test
    void 정수최댓값페이지도거부한다() {
        Sort sort = Sort.by(Sort.Direction.DESC, "createdAt");

        assertThatThrownBy(() -> BoundedPageRequestFactory.of(Integer.MAX_VALUE, 10, sort))
                .isInstanceOf(InvalidRequestException.class)
                .hasMessage("페이지 상한을 초과했습니다.");
    }
}
