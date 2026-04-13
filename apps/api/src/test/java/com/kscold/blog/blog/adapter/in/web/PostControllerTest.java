package com.kscold.blog.blog.adapter.in.web;

import com.kscold.blog.blog.adapter.in.web.dto.PostResponse;
import com.kscold.blog.blog.application.port.in.AccessRequestUseCase;
import com.kscold.blog.blog.application.port.in.CategoryUseCase;
import com.kscold.blog.blog.application.port.in.PostUseCase;
import com.kscold.blog.blog.domain.model.Category;
import com.kscold.blog.blog.domain.model.Post;
import com.kscold.blog.shared.web.ApiResponse;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PostControllerTest {

    @Mock
    private PostUseCase postUseCase;

    @Mock
    private AccessRequestUseCase accessRequestUseCase;

    @Mock
    private CategoryUseCase categoryUseCase;

    @InjectMocks
    private PostController postController;

    @Test
    @DisplayName("시나리오: 제한 카테고리 글이어도 완전 공개가 켜져 있으면 본문을 그대로 반환한다")
    void getPostByIdReturnsFullPostWhenPublicOverrideIsEnabled() {
        Post post = post(true);
        when(postUseCase.getById("post-1")).thenReturn(post);

        ResponseEntity<ApiResponse<PostResponse>> response = postController.getPostById("post-1", "user-1");

        assertThat(response.getBody()).isNotNull();
        PostResponse data = response.getBody().getData();
        assertThat(data.getRestricted()).isNull();
        assertThat(data.getContent()).isEqualTo("본문");
        assertThat(data.getPublicOverride()).isTrue();
        verify(categoryUseCase, never()).getById("cat-1");
        verify(accessRequestUseCase, never()).hasAccess("user-1", "post-1", "cat-1");
    }

    @Test
    @DisplayName("시나리오: 제한 카테고리 글이고 완전 공개가 꺼져 있으면 기존처럼 제한 응답을 반환한다")
    void getPostByIdReturnsRestrictedResponseWhenPublicOverrideIsDisabled() {
        Post post = post(false);
        Category restrictedCategory = Category.builder()
                .id("cat-1")
                .name("개발 이야기")
                .restricted(true)
                .build();
        when(postUseCase.getById("post-1")).thenReturn(post);
        when(categoryUseCase.getById("cat-1")).thenReturn(restrictedCategory);
        when(accessRequestUseCase.hasAccess("user-1", "post-1", "cat-1")).thenReturn(false);

        ResponseEntity<ApiResponse<PostResponse>> response = postController.getPostById("post-1", "user-1");

        assertThat(response.getBody()).isNotNull();
        PostResponse data = response.getBody().getData();
        assertThat(data.getRestricted()).isTrue();
        assertThat(data.getContent()).isNull();
        assertThat(data.getPublicOverride()).isFalse();
    }

    private static Post post(boolean publicOverride) {
        return Post.builder()
                .id("post-1")
                .title("테스트 글")
                .slug("test-post")
                .content("본문")
                .excerpt("요약")
                .publicOverride(publicOverride)
                .category(Post.CategoryInfo.builder()
                        .id("cat-1")
                        .name("개발 이야기")
                        .slug("dev-story")
                        .build())
                .build();
    }
}
