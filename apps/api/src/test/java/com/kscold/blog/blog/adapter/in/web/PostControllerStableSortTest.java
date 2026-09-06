package com.kscold.blog.blog.adapter.in.web;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.kscold.blog.analytics.application.service.ViewCounter;
import com.kscold.blog.blog.application.port.in.AccessRequestUseCase;
import com.kscold.blog.blog.application.port.in.CategoryUseCase;
import com.kscold.blog.blog.application.port.in.PostUseCase;
import com.kscold.blog.shared.web.ClientIdentifierResolver;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

@ExtendWith(MockitoExtension.class)
class PostControllerStableSortTest {

    @Mock private PostUseCase postUseCase;
    @Mock private AccessRequestUseCase accessRequestUseCase;
    @Mock private CategoryUseCase categoryUseCase;
    @Mock private ViewCounter viewCounter;
    @Mock private ClientIdentifierResolver clientIdentifierResolver;

    @InjectMocks private PostController postController;

    @Test
    @DisplayName("시나리오: 카테고리 목록은 발행일과 식별자로 안정 정렬한다")
    void categoryPostsUseStableSort() {
        when(postUseCase.getByCategory(any(), any())).thenReturn(Page.empty());
        when(categoryUseCase.getAll()).thenReturn(List.of());

        postController.getPostsByCategory("cat-1", 0, 10);

        ArgumentCaptor<Pageable> captor = ArgumentCaptor.forClass(Pageable.class);
        verify(postUseCase).getByCategory(eq("cat-1"), captor.capture());
        assertStableSort(captor.getValue(), "publishedAt", Sort.Direction.DESC);
    }

    @Test
    @DisplayName("시나리오: 태그 목록은 발행일과 식별자로 안정 정렬한다")
    void tagPostsUseStableSort() {
        when(postUseCase.getByTag(any(), any())).thenReturn(Page.empty());
        when(categoryUseCase.getAll()).thenReturn(List.of());

        postController.getPostsByTag("tag-1", 0, 10);

        ArgumentCaptor<Pageable> captor = ArgumentCaptor.forClass(Pageable.class);
        verify(postUseCase).getByTag(eq("tag-1"), captor.capture());
        assertStableSort(captor.getValue(), "publishedAt", Sort.Direction.DESC);
    }

    @Test
    @DisplayName("시나리오: 검색 목록은 발행일과 식별자로 안정 정렬한다")
    void searchPostsUseStableSort() {
        when(postUseCase.search(any(), any())).thenReturn(Page.empty());
        when(categoryUseCase.getAll()).thenReturn(List.of());

        postController.searchPosts("검색어", 0, 10);

        ArgumentCaptor<Pageable> captor = ArgumentCaptor.forClass(Pageable.class);
        verify(postUseCase).search(eq("검색어"), captor.capture());
        assertStableSort(captor.getValue(), "publishedAt", Sort.Direction.DESC);
    }

    @Test
    @DisplayName("시나리오: 인기 글은 조회수와 식별자로 안정 정렬한다")
    void featuredPostsUseStableSort() {
        when(postUseCase.getFeatured(any())).thenReturn(List.of());
        when(categoryUseCase.getAll()).thenReturn(List.of());

        postController.getFeaturedPosts(5);

        ArgumentCaptor<Pageable> captor = ArgumentCaptor.forClass(Pageable.class);
        verify(postUseCase).getFeatured(captor.capture());
        assertStableSort(captor.getValue(), "views", Sort.Direction.DESC);
    }

    @Test
    @DisplayName("시나리오: 관리자 목록은 생성일과 식별자로 안정 정렬한다")
    void adminPostsUseStableSort() {
        when(postUseCase.getAllAdmin(any())).thenReturn(Page.empty());

        postController.getAdminPosts(0, 20);

        ArgumentCaptor<Pageable> captor = ArgumentCaptor.forClass(Pageable.class);
        verify(postUseCase).getAllAdmin(captor.capture());
        assertStableSort(captor.getValue(), "createdAt", Sort.Direction.DESC);
    }

    private void assertStableSort(
            Pageable pageable, String primaryField, Sort.Direction direction) {
        assertThat(pageable.getSort().toList())
                .extracting(Sort.Order::getProperty)
                .containsExactly(primaryField, "id");
        assertThat(pageable.getSort().toList())
                .extracting(Sort.Order::getDirection)
                .containsExactly(direction, direction);
    }
}
