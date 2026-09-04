package com.kscold.blog.shared.web;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.kscold.blog.exception.InvalidRequestException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class PublicSearchQueryNormalizerTest {

    @Test
    @DisplayName("시나리오: 공개 검색어의 앞뒤 공백을 제거한다")
    void normalizeTrimsWhitespace() {
        assertThat(PublicSearchQueryNormalizer.normalize("  LangGraph  ")).isEqualTo("LangGraph");
    }

    @Test
    @DisplayName("시나리오: 공백뿐인 검색어를 거부한다")
    void normalizeRejectsBlankQuery() {
        assertThatThrownBy(() -> PublicSearchQueryNormalizer.normalize("   "))
                .isInstanceOf(InvalidRequestException.class);
    }

    @Test
    @DisplayName("시나리오: 제한보다 긴 검색어를 MongoDB에 전달하지 않는다")
    void normalizeRejectsOversizedQuery() {
        String oversized = "가".repeat(PublicSearchQueryNormalizer.MAX_LENGTH + 1);

        assertThatThrownBy(() -> PublicSearchQueryNormalizer.normalize(oversized))
                .isInstanceOf(InvalidRequestException.class);
    }
}
