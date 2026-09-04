package com.kscold.blog.blog.adapter.in.web.dto.response;

import static org.assertj.core.api.Assertions.assertThat;

import com.kscold.blog.blog.domain.model.Post;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class PostResponseTest {

    @Test
    @DisplayName("시나리오: 포스트 태그에 저장된 슬러그를 응답한다")
    void fromReturnsStoredTagSlug() {
        Post post = postWithTag("AI Agent", "agent");

        PostResponse response = PostResponse.from(post);

        assertThat(response.getTags().getFirst().getSlug()).isEqualTo("agent");
    }

    @Test
    @DisplayName("시나리오: 기존 포스트 태그에 슬러그가 없으면 이름으로 보완한다")
    void fromGeneratesMissingTagSlug() {
        Post post = postWithTag("AI Agent", null);

        PostResponse response = PostResponse.from(post);

        assertThat(response.getTags().getFirst().getSlug()).isEqualTo("ai-agent");
    }

    private static Post postWithTag(String name, String slug) {
        return Post.builder()
                .tags(List.of(Post.TagInfo.builder().id("tag-1").name(name).slug(slug).build()))
                .build();
    }
}
