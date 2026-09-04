package com.kscold.blog.blog.application.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.kscold.blog.blog.application.dto.command.CategoryUpdateCommand;
import com.kscold.blog.blog.domain.model.Category;
import com.kscold.blog.blog.domain.model.Post;
import com.kscold.blog.blog.domain.port.out.CategoryRepository;
import com.kscold.blog.blog.domain.port.out.PostRepository;
import com.kscold.blog.exception.InvalidRequestException;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

class CategoryApplicationServiceTest {

    private CategoryRepository categoryRepository;
    private PostRepository postRepository;
    private CategoryApplicationService service;

    @BeforeEach
    void setUp() {
        categoryRepository = mock(CategoryRepository.class);
        postRepository = mock(PostRepository.class);
        service = new CategoryApplicationService(categoryRepository, postRepository);
    }

    @Test
    @DisplayName("시나리오: 카테고리 이름이나 슬러그를 바꾸면 포스트 참조도 동기화한다")
    void updateSynchronizesPostReferences() {
        Category category = category(2);
        when(categoryRepository.findById("category-1")).thenReturn(Optional.of(category));
        when(categoryRepository.save(category)).thenReturn(category);

        Category updated = service.update("category-1", command("AI 개발", "ai-development"));

        ArgumentCaptor<Post.CategoryInfo> reference =
                ArgumentCaptor.forClass(Post.CategoryInfo.class);
        verify(postRepository).updateCategoryReference(reference.capture());
        assertThat(reference.getValue().getName()).isEqualTo("AI 개발");
        assertThat(reference.getValue().getSlug()).isEqualTo("ai-development");
        assertThat(updated.getSlug()).isEqualTo("ai-development");
    }

    @Test
    @DisplayName("시나리오: 표시 정보가 그대로면 포스트 참조를 다시 쓰지 않는다")
    void updateDescriptionDoesNotRewritePostReferences() {
        Category category = category(2);
        when(categoryRepository.findById("category-1")).thenReturn(Optional.of(category));
        when(categoryRepository.save(category)).thenReturn(category);

        service.update("category-1", command("AI", "ai"));

        verify(postRepository, never()).updateCategoryReference(any());
    }

    @Test
    @DisplayName("시나리오: 포스트가 남은 카테고리는 삭제하지 않는다")
    void deleteRejectsCategoryWithPosts() {
        Category category = category(2);
        when(categoryRepository.findById("category-1")).thenReturn(Optional.of(category));
        when(categoryRepository.findByParent("category-1")).thenReturn(List.of());

        assertThatThrownBy(() -> service.delete("category-1"))
                .isInstanceOf(InvalidRequestException.class);

        verify(categoryRepository, never()).delete(any());
    }

    private Category category(int postCount) {
        return Category.builder()
                .id("category-1")
                .name("AI")
                .slug("ai")
                .description("설명")
                .postCount(postCount)
                .build();
    }

    private CategoryUpdateCommand command(String name, String slug) {
        return CategoryUpdateCommand.builder().name(name).slug(slug).description("새 설명").build();
    }
}
