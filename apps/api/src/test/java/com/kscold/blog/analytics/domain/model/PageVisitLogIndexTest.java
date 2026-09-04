package com.kscold.blog.analytics.domain.model;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.data.mongodb.core.index.CompoundIndex;

class PageVisitLogIndexTest {

    @Test
    void declaresPathAndCreatedAtCompoundIndex() {
        CompoundIndex index = PageVisitLog.class.getAnnotation(CompoundIndex.class);

        assertThat(index).isNotNull();
        assertThat(index.name()).isEqualTo("path_createdAt_idx");
        assertThat(index.def()).isEqualTo("{'path': 1, 'createdAt': -1}");
    }
}
