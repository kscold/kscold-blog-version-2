package com.kscold.blog.blog.application.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.kscold.blog.blog.application.dto.command.TagCommand;
import com.kscold.blog.blog.domain.model.Post;
import com.kscold.blog.blog.domain.model.Tag;
import com.kscold.blog.blog.domain.port.out.PostRepository;
import com.kscold.blog.blog.domain.port.out.TagRepository;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

class TagApplicationServiceTest {

    private TagRepository tagRepository;
    private PostRepository postRepository;
    private TagApplicationService service;

    @BeforeEach
    void setUp() {
        tagRepository = mock(TagRepository.class);
        postRepository = mock(PostRepository.class);
        service = new TagApplicationService(tagRepository, postRepository);
    }

    @Test
    @DisplayName("시나리오: 태그 이름이나 슬러그를 바꾸면 포스트 참조도 동기화한다")
    void updateSynchronizesPostReferences() {
        Tag tag = tag();
        when(tagRepository.findById("tag-1")).thenReturn(Optional.of(tag));
        when(tagRepository.save(tag)).thenReturn(tag);

        Tag updated = service.update("tag-1", command("AI Agent", "ai-agent"));

        ArgumentCaptor<Post.TagInfo> reference = ArgumentCaptor.forClass(Post.TagInfo.class);
        verify(postRepository).updateTagReference(reference.capture());
        assertThat(reference.getValue().getName()).isEqualTo("AI Agent");
        assertThat(reference.getValue().getSlug()).isEqualTo("ai-agent");
        assertThat(updated.getName()).isEqualTo("AI Agent");
    }

    @Test
    @DisplayName("시나리오: 태그 분류만 바꾸면 포스트 참조를 다시 쓰지 않는다")
    void updateCategoryDoesNotRewritePostReferences() {
        Tag tag = tag();
        when(tagRepository.findById("tag-1")).thenReturn(Optional.of(tag));
        when(tagRepository.save(tag)).thenReturn(tag);

        service.update("tag-1", command("AI", "ai"));

        verify(postRepository, never()).updateTagReference(any());
        assertThat(tag.getCategoryId()).isEqualTo("category-2");
    }

    private Tag tag() {
        return Tag.builder().id("tag-1").name("AI").slug("ai").categoryId("category-1").build();
    }

    private TagCommand command(String name, String slug) {
        return TagCommand.builder().name(name).slug(slug).categoryId("category-2").build();
    }
}
