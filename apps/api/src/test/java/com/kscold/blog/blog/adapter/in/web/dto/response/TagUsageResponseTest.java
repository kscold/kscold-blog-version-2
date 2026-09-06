package com.kscold.blog.blog.adapter.in.web.dto.response;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.kscold.blog.blog.domain.model.TagUsage;
import org.junit.jupiter.api.Test;

class TagUsageResponseTest {

    @Test
    void exposesPublicPostCountWithoutChangingTheTotalCountContract()
            throws JsonProcessingException {
        TagUsage usage = new TagUsage("t1", "AI", "ai", "c1", "개발", 7L, 5L, 3L);

        TagUsageResponse response = TagUsageResponse.from(usage);

        assertThat(response.getPostCount()).isEqualTo(7L);
        assertThat(response.getPublicPostCount()).isEqualTo(5L);
        assertThat(response.getFeedCount()).isEqualTo(3L);
        assertThat(response.getTotalCount()).isEqualTo(10L);
        assertThat(new ObjectMapper().writeValueAsString(response))
                .contains("\"publicPostCount\":5");
    }
}
