package com.kscold.blog.blog.adapter.in.web;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.kscold.blog.analytics.application.service.ViewCounter;
import com.kscold.blog.blog.adapter.in.web.dto.response.PostResponse;
import com.kscold.blog.blog.application.port.in.AccessRequestUseCase;
import com.kscold.blog.blog.application.port.in.CategoryUseCase;
import com.kscold.blog.blog.application.port.in.PostUseCase;
import com.kscold.blog.blog.domain.model.Category;
import com.kscold.blog.blog.domain.model.Post;
import com.kscold.blog.exception.ResourceNotFoundException;
import com.kscold.blog.shared.web.ApiResponse;
import com.kscold.blog.shared.web.ClientIdentifierResolver;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

@ExtendWith(MockitoExtension.class)
class PostControllerTest {

    @Mock private PostUseCase postUseCase;

    @Mock private AccessRequestUseCase accessRequestUseCase;

    @Mock private CategoryUseCase categoryUseCase;

    @Mock private ViewCounter viewCounter;

    @Mock private ClientIdentifierResolver clientIdentifierResolver;

    @Mock private HttpServletRequest httpServletRequest;

    @InjectMocks private PostController postController;

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("시나리오: 제한 카테고리 글이어도 완전 공개가 켜져 있으면 본문을 그대로 반환한다")
    void getPostByIdReturnsFullPostWhenPublicOverrideIsEnabled() {
        Post post = post(true);
        when(postUseCase.getById("post-1")).thenReturn(post);

        ResponseEntity<ApiResponse<PostResponse>> response =
                postController.getPostById("post-1", "user-1", httpServletRequest);

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
        Category restrictedCategory =
                Category.builder().id("cat-1").name("개발 이야기").restricted(true).build();
        when(postUseCase.getById("post-1")).thenReturn(post);
        when(categoryUseCase.getById("cat-1")).thenReturn(restrictedCategory);
        when(accessRequestUseCase.hasAccess("user-1", "post-1", "cat-1")).thenReturn(false);

        ResponseEntity<ApiResponse<PostResponse>> response =
                postController.getPostById("post-1", "user-1", httpServletRequest);

        assertThat(response.getBody()).isNotNull();
        PostResponse data = response.getBody().getData();
        assertThat(data.getRestricted()).isTrue();
        assertThat(data.getContent()).isNull();
        assertThat(data.getPublicOverride()).isFalse();
    }

    @Test
    @DisplayName("시나리오: 관리자라면 제한 카테고리 글도 승인 요청 없이 본문을 그대로 반환한다")
    void getPostByIdReturnsFullPostForAdmin() {
        SecurityContextHolder.getContext()
                .setAuthentication(
                        new UsernamePasswordAuthenticationToken(
                                "admin-1",
                                null,
                                List.of(new SimpleGrantedAuthority("ROLE_ADMIN"))));
        Post post = post(false);
        Category restrictedCategory =
                Category.builder().id("cat-1").name("개발 이야기").restricted(true).build();
        when(postUseCase.getById("post-1")).thenReturn(post);
        when(categoryUseCase.getById("cat-1")).thenReturn(restrictedCategory);

        ResponseEntity<ApiResponse<PostResponse>> response =
                postController.getPostById("post-1", "admin-1", httpServletRequest);

        assertThat(response.getBody()).isNotNull();
        PostResponse data = response.getBody().getData();
        assertThat(data.getRestricted()).isTrue();
        assertThat(data.getContent()).isEqualTo("본문");
        verify(accessRequestUseCase, never()).hasAccess("admin-1", "post-1", "cat-1");
    }

    @Test
    @DisplayName("시나리오: 공개 글 목록은 카드에 불필요한 본문을 반환하지 않는다")
    void getAllPostsOmitsContent() {
        Post post = post(true);
        when(postUseCase.getAll(any())).thenReturn(new PageImpl<>(List.of(post)));

        ResponseEntity<ApiResponse<Page<PostResponse>>> response =
                postController.getAllPosts(0, 10, "publishedAt", "desc");

        assertThat(response.getBody()).isNotNull();
        PostResponse data = response.getBody().getData().getContent().getFirst();
        assertThat(data.getContent()).isNull();
        assertThat(data.getExcerpt()).isEqualTo("요약");
        assertThat(data.getRestricted()).isNull();
    }

    @Test
    @DisplayName("시나리오: 공개 글 목록은 과도한 크기와 임의 정렬 필드를 제한한다")
    void getAllPostsLimitsPageSizeAndSortField() {
        when(postUseCase.getAll(any())).thenReturn(Page.empty());

        postController.getAllPosts(-1, 10_000, "content", "asc");

        ArgumentCaptor<Pageable> pageableCaptor = ArgumentCaptor.forClass(Pageable.class);
        verify(postUseCase).getAll(pageableCaptor.capture());
        Pageable pageable = pageableCaptor.getValue();
        assertThat(pageable.getPageNumber()).isZero();
        assertThat(pageable.getPageSize()).isEqualTo(100);
        assertThat(pageable.getSort().getOrderFor("publishedAt")).isNotNull();
        assertThat(pageable.getSort().getOrderFor("content")).isNull();
    }

    @Test
    @DisplayName("시나리오: 공개 글 목록은 카테고리를 한 번만 읽어 모든 제한 여부를 판정한다")
    void getAllPostsLoadsRestrictionCategoriesOnce() {
        Post first = post(false);
        Post second = post(false);
        second.setId("post-2");
        Category restrictedCategory =
                Category.builder().id("cat-1").name("개발 이야기").restricted(true).build();
        when(postUseCase.getAll(any())).thenReturn(new PageImpl<>(List.of(first, second)));
        when(categoryUseCase.getAll()).thenReturn(List.of(restrictedCategory));

        ResponseEntity<ApiResponse<Page<PostResponse>>> response =
                postController.getAllPosts(0, 10, "publishedAt", "desc");

        assertThat(response.getBody().getData().getContent())
                .extracting(PostResponse::getRestricted)
                .containsExactly(true, true);
        verify(categoryUseCase).getAll();
        verify(categoryUseCase, never()).getById(any());
    }

    @Test
    @DisplayName("시나리오: 제한 카테고리를 확인할 수 없으면 단건 본문을 안전하게 숨긴다")
    void getPostByIdFailsClosedWhenCategoryLookupFails() {
        Post post = post(false);
        when(postUseCase.getById("post-1")).thenReturn(post);
        when(categoryUseCase.getById("cat-1"))
                .thenThrow(ResourceNotFoundException.category("cat-1"));

        ResponseEntity<ApiResponse<PostResponse>> response =
                postController.getPostById("post-1", null, httpServletRequest);

        assertThat(response.getBody().getData().getRestricted()).isTrue();
        assertThat(response.getBody().getData().getContent()).isNull();
    }

    @Test
    @DisplayName("시나리오: 비관리자가 초안 단건을 요청하면 존재를 숨기고 찾을 수 없음으로 응답한다")
    void getPostBySlugHidesDraftFromPublicViewer() {
        Post draft = post(true);
        draft.setStatus(Post.Status.DRAFT);
        when(postUseCase.getBySlug("test-post")).thenReturn(draft);

        assertThatThrownBy(
                        () -> postController.getPostBySlug("test-post", null, httpServletRequest))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    @DisplayName("시나리오: 관리자는 미리보기를 위해 초안 단건의 본문을 조회할 수 있다")
    void getPostBySlugReturnsDraftForAdmin() {
        SecurityContextHolder.getContext()
                .setAuthentication(
                        new UsernamePasswordAuthenticationToken(
                                "admin-1",
                                null,
                                List.of(new SimpleGrantedAuthority("ROLE_ADMIN"))));
        Post draft = post(true);
        draft.setStatus(Post.Status.DRAFT);
        when(postUseCase.getBySlug("test-post")).thenReturn(draft);

        ResponseEntity<ApiResponse<PostResponse>> response =
                postController.getPostBySlug("test-post", "admin-1", httpServletRequest);

        assertThat(response.getBody().getData().getContent()).isEqualTo("본문");
    }

    private static Post post(boolean publicOverride) {
        return Post.builder()
                .id("post-1")
                .title("테스트 글")
                .slug("test-post")
                .content("본문")
                .excerpt("요약")
                .status(Post.Status.PUBLISHED)
                .publicOverride(publicOverride)
                .category(
                        Post.CategoryInfo.builder()
                                .id("cat-1")
                                .name("개발 이야기")
                                .slug("dev-story")
                                .build())
                .build();
    }
}
