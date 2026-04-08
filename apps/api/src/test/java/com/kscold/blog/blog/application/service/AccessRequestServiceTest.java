package com.kscold.blog.blog.application.service;

import com.kscold.blog.blog.application.port.in.PostUseCase;
import com.kscold.blog.blog.domain.model.AccessRequest;
import com.kscold.blog.blog.domain.model.Post;
import com.kscold.blog.blog.domain.port.out.AccessRequestRepository;
import com.kscold.blog.exception.InvalidRequestException;
import com.kscold.blog.identity.application.port.in.UserQueryPort;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AccessRequestServiceTest {

    @Mock
    private AccessRequestRepository accessRequestRepository;

    @Mock
    private PostUseCase postUseCase;

    @Mock
    private UserQueryPort userQueryPort;

    @InjectMocks
    private AccessRequestService accessRequestService;

    @Test
    @DisplayName("시나리오: 사용자가 제한 글 열람을 요청하면 포스트와 카테고리 정보가 함께 저장된다")
    void requestAccessStoresPostAndCategoryContext() {
        Post post = post("post-1", "권한 모델", "access-model", "cat-1", "개발 이야기");
        when(postUseCase.getById("post-1")).thenReturn(post);
        when(userQueryPort.getUserById("user-1")).thenReturn(new UserQueryPort.UserInfo("user-1", "김승찬", null, false));
        when(accessRequestRepository.findAllByUserIdAndCategoryId("user-1", "cat-1")).thenReturn(List.of());
        when(accessRequestRepository.findByUserIdAndPostId("user-1", "post-1")).thenReturn(Optional.empty());
        when(accessRequestRepository.save(any(AccessRequest.class))).thenAnswer(invocation -> invocation.getArgument(0));

        AccessRequest saved = accessRequestService.requestAccess("user-1", "post-1", "이 글을 읽고 싶습니다.");

        assertThat(saved.getUserId()).isEqualTo("user-1");
        assertThat(saved.getUsername()).isEqualTo("김승찬");
        assertThat(saved.getPostId()).isEqualTo("post-1");
        assertThat(saved.getPostTitle()).isEqualTo("권한 모델");
        assertThat(saved.getPostSlug()).isEqualTo("access-model");
        assertThat(saved.getCategoryId()).isEqualTo("cat-1");
        assertThat(saved.getCategoryName()).isEqualTo("개발 이야기");
        assertThat(saved.getStatus()).isEqualTo(AccessRequest.Status.PENDING);
        assertThat(saved.getGrantScope()).isEqualTo(AccessRequest.GrantScope.POST);
    }

    @Test
    @DisplayName("시나리오: 글 단위로 승인된 요청은 해당 글에만 열람 권한을 부여한다")
    void postScopeApprovalOnlyAllowsRequestedPost() {
        AccessRequest approvedPostGrant = AccessRequest.builder()
                .userId("user-1")
                .postId("post-1")
                .categoryId("cat-1")
                .status(AccessRequest.Status.APPROVED)
                .grantScope(AccessRequest.GrantScope.POST)
                .build();

        when(userQueryPort.getUserById("user-1")).thenReturn(new UserQueryPort.UserInfo("user-1", "김승찬", null, false));
        when(accessRequestRepository.findAllByUserIdAndCategoryId("user-1", "cat-1")).thenReturn(List.of(approvedPostGrant));
        when(accessRequestRepository.findByUserIdAndPostId("user-1", "post-1")).thenReturn(Optional.of(approvedPostGrant));
        when(accessRequestRepository.findByUserIdAndPostId("user-1", "post-2")).thenReturn(Optional.empty());

        assertThat(accessRequestService.hasAccess("user-1", "post-1", "cat-1")).isTrue();
        assertThat(accessRequestService.hasAccess("user-1", "post-2", "cat-1")).isFalse();
    }

    @Test
    @DisplayName("시나리오: 카테고리 단위로 승인된 요청은 같은 카테고리의 다른 글도 열람할 수 있게 한다")
    void categoryScopeApprovalAllowsWholeCategory() {
        AccessRequest approvedCategoryGrant = AccessRequest.builder()
                .userId("user-1")
                .postId("post-1")
                .categoryId("cat-1")
                .status(AccessRequest.Status.APPROVED)
                .grantScope(AccessRequest.GrantScope.CATEGORY)
                .build();

        when(userQueryPort.getUserById("user-1")).thenReturn(new UserQueryPort.UserInfo("user-1", "김승찬", null, false));
        when(accessRequestRepository.findAllByUserIdAndCategoryId("user-1", "cat-1")).thenReturn(List.of(approvedCategoryGrant));

        assertThat(accessRequestService.hasAccess("user-1", "post-999", "cat-1")).isTrue();
    }

    @Test
    @DisplayName("시나리오: 카테고리 범위가 저장된 요청만 전체 카테고리 열람 권한으로 인식된다")
    void categoryApprovalRequiresExplicitCategoryScope() {
        AccessRequest categoryApprovedRequest = AccessRequest.builder()
                .userId("user-1")
                .categoryId("cat-1")
                .categoryName("개발 이야기")
                .status(AccessRequest.Status.APPROVED)
                .grantScope(AccessRequest.GrantScope.CATEGORY)
                .build();

        when(userQueryPort.getUserById("user-1")).thenReturn(new UserQueryPort.UserInfo("user-1", "김승찬", null, false));
        when(accessRequestRepository.findAllByUserIdAndCategoryId("user-1", "cat-1")).thenReturn(List.of(categoryApprovedRequest));

        assertThat(accessRequestService.hasAccess("user-1", "post-legacy", "cat-1")).isTrue();
    }

    @Test
    @DisplayName("시나리오: 기존 글 요청이 거절되었으면 같은 글을 재요청할 때 다시 대기 상태로 되돌린다")
    void requestAccessReopensRejectedPostRequest() {
        Post post = post("post-1", "권한 모델", "access-model", "cat-1", "개발 이야기");
        AccessRequest rejectedPostRequest = AccessRequest.builder()
                .id("req-1")
                .userId("user-1")
                .username("예전이름")
                .postId("post-1")
                .postTitle("예전 제목")
                .postSlug("old-slug")
                .categoryId("cat-1")
                .categoryName("개발 이야기")
                .status(AccessRequest.Status.REJECTED)
                .grantScope(AccessRequest.GrantScope.CATEGORY)
                .message("예전 요청")
                .build();

        when(postUseCase.getById("post-1")).thenReturn(post);
        when(userQueryPort.getUserById("user-1")).thenReturn(new UserQueryPort.UserInfo("user-1", "김승찬", null, false));
        when(accessRequestRepository.findAllByUserIdAndCategoryId("user-1", "cat-1")).thenReturn(List.of(rejectedPostRequest));
        when(accessRequestRepository.findByUserIdAndPostId("user-1", "post-1")).thenReturn(Optional.of(rejectedPostRequest));
        when(accessRequestRepository.save(any(AccessRequest.class))).thenAnswer(invocation -> invocation.getArgument(0));

        AccessRequest reopened = accessRequestService.requestAccess("user-1", "post-1", "다시 읽고 싶습니다.");

        assertThat(reopened.getId()).isEqualTo("req-1");
        assertThat(reopened.getStatus()).isEqualTo(AccessRequest.Status.PENDING);
        assertThat(reopened.getUsername()).isEqualTo("김승찬");
        assertThat(reopened.getPostId()).isEqualTo("post-1");
        assertThat(reopened.getPostTitle()).isEqualTo("권한 모델");
        assertThat(reopened.getGrantScope()).isEqualTo(AccessRequest.GrantScope.POST);
        assertThat(reopened.getMessage()).isEqualTo("다시 읽고 싶습니다.");
    }

    @Test
    @DisplayName("시나리오: 승인 요청에 범위가 비어 있으면 이미 저장된 범위를 사용한다")
    void approveFallsBackToStoredScope() {
        AccessRequest pendingRequest = AccessRequest.builder()
                .id("req-1")
                .userId("user-1")
                .postId("post-1")
                .categoryId("cat-1")
                .status(AccessRequest.Status.PENDING)
                .grantScope(AccessRequest.GrantScope.POST)
                .build();

        when(accessRequestRepository.findById("req-1")).thenReturn(Optional.of(pendingRequest));
        when(accessRequestRepository.save(any(AccessRequest.class))).thenAnswer(invocation -> invocation.getArgument(0));

        AccessRequest approved = accessRequestService.approve("req-1", null);

        assertThat(approved.getStatus()).isEqualTo(AccessRequest.Status.APPROVED);
        assertThat(approved.getGrantScope()).isEqualTo(AccessRequest.GrantScope.POST);
    }

    @Test
    @DisplayName("시나리오: 저장된 범위도 없는 요청은 승인할 수 없다")
    void approveRejectsRequestWithoutStoredScope() {
        AccessRequest invalidPendingRequest = AccessRequest.builder()
                .id("req-1")
                .userId("user-1")
                .postId("post-1")
                .categoryId("cat-1")
                .status(AccessRequest.Status.PENDING)
                .grantScope(null)
                .build();

        when(accessRequestRepository.findById("req-1")).thenReturn(Optional.of(invalidPendingRequest));

        assertThatThrownBy(() -> accessRequestService.approve("req-1", null))
                .isInstanceOf(InvalidRequestException.class)
                .hasMessageContaining("승인 범위를 찾을 수 없습니다");

        verify(accessRequestRepository, never()).save(any());
    }

    private static Post post(String id, String title, String slug, String categoryId, String categoryName) {
        return Post.builder()
                .id(id)
                .title(title)
                .slug(slug)
                .category(Post.CategoryInfo.builder()
                        .id(categoryId)
                        .name(categoryName)
                        .slug("dev-story")
                        .build())
                .build();
    }
}
