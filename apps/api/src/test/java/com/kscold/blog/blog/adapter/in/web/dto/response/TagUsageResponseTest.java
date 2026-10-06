package com.kscold.blog.blog.adapter.in.web.dto.response;

import static org.assertj.core.api.Assertions.assertThat;

import com.kscold.blog.blog.domain.model.TagUsage;
import com.kscold.blog.support.TestJson;
import org.junit.jupiter.api.Test;

class TagUsageResponseTest {

    @Test
    void exposesPublicPostCountWithoutChangingTheTotalCountContract() {
        TagUsage usage = new TagUsage("t1", "AI", "ai", "c1", "개발", 7L, 5L, 3L);

        TagUsageResponse response = TagUsageResponse.from(usage);

        assertThat(response.getPostCount()).isEqualTo(7L);
        assertThat(response.getPublicPostCount()).isEqualTo(5L);
        assertThat(response.getFeedCount()).isEqualTo(3L);
        assertThat(response.getTotalCount()).isEqualTo(10L);
        assertThat(TestJson.mapper().writeValueAsString(response))
                .contains("\"publicPostCount\":5");
    }
}
