package com.kscold.blog.blog.adapter.in.web;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.kscold.blog.analytics.application.service.ViewCounter;
import com.kscold.blog.blog.application.port.in.AccessRequestUseCase;
import com.kscold.blog.blog.application.port.in.CategoryUseCase;
import com.kscold.blog.blog.application.port.in.PostUseCase;
import com.kscold.blog.exception.InvalidRequestException;
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

@ExtendWith(MockitoExtension.class)
class PostControllerPageLimitTest {

    @Mock private PostUseCase postUseCase;
    @Mock private AccessRequestUseCase accessRequestUseCase;
    @Mock private CategoryUseCase categoryUseCase;
    @Mock private ViewCounter viewCounter;
    @Mock private ClientIdentifierResolver clientIdentifierResolver;

    @InjectMocks private PostController postController;

    @Test
    @DisplayName("시나리오: 공개 목록은 마지막 허용 페이지를 그대로 조회한다")
    void allPostsAcceptMaximumPage() {
        when(postUseCase.getAll(any())).thenReturn(Page.empty());
        when(categoryUseCase.getAll()).thenReturn(List.of());

        postController.getAllPosts(499, 10, "publishedAt", "desc");

        ArgumentCaptor<Pageable> captor = ArgumentCaptor.forClass(Pageable.class);
        verify(postUseCase).getAll(captor.capture());
        assertThat(captor.getValue().getPageNumber()).isEqualTo(499);
    }

    @Test
    @DisplayName("시나리오: 공개 전체 목록의 깊은 페이지는 조회 전에 거부한다")
    void allPostsRejectExcessivePage() {
        assertThatThrownBy(() -> postController.getAllPosts(500, 10, "publishedAt", "desc"))
                .isInstanceOf(InvalidRequestException.class);

        verify(postUseCase, never()).getAll(any());
    }

    @Test
    @DisplayName("시나리오: 카테고리 목록의 깊은 페이지는 조회 전에 거부한다")
    void categoryPostsRejectExcessivePage() {
        assertThatThrownBy(() -> postController.getPostsByCategory("cat-1", 500, 10))
                .isInstanceOf(InvalidRequestException.class);

        verify(postUseCase, never()).getByCategory(any(), any());
    }

    @Test
    @DisplayName("시나리오: 태그 목록의 깊은 페이지는 조회 전에 거부한다")
    void tagPostsRejectExcessivePage() {
        assertThatThrownBy(() -> postController.getPostsByTag("tag-1", 500, 10))
                .isInstanceOf(InvalidRequestException.class);

        verify(postUseCase, never()).getByTag(any(), any());
    }

    @Test
    @DisplayName("시나리오: 검색 목록의 깊은 페이지는 조회 전에 거부한다")
    void searchPostsRejectExcessivePage() {
        assertThatThrownBy(() -> postController.searchPosts("검색어", 500, 10))
                .isInstanceOf(InvalidRequestException.class);

        verify(postUseCase, never()).search(any(), any());
    }
}
