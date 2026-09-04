package com.kscold.blog.blog.application.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.kscold.blog.blog.domain.model.Post;
import com.kscold.blog.blog.domain.port.out.PostRepository;
import com.kscold.blog.blog.domain.port.out.TagRepository;
import java.time.LocalDateTime;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

@ExtendWith(MockitoExtension.class)
class PostApplicationServiceTest {

    @Mock private PostRepository postRepository;

    @Mock private PostDraftService postDraftService;

    @Mock private PostReferenceService postReferenceService;

    @Mock private TagRepository tagRepository;

    @InjectMocks private PostApplicationService postApplicationService;

    @Test
    @DisplayName("시나리오: 최근 인기 글이 요청 개수만큼 있으면 전체 기간 글을 조회하지 않는다")
    void getFeaturedUsesRecentPopularPostsFirst() {
        Pageable pageable = PageRequest.of(0, 2, Sort.by(Sort.Direction.DESC, "views"));
        List<Post> recent = List.of(post("recent-1"), post("recent-2"));
        when(postRepository.findHotPosts(
                        any(LocalDateTime.class), org.mockito.ArgumentMatchers.eq(pageable)))
                .thenReturn(recent);

        List<Post> result = postApplicationService.getFeatured(pageable);

        assertThat(result).isEqualTo(recent);
        verify(postRepository, never()).findAllPublished(pageable);
    }

    @Test
    @DisplayName("시나리오: 최근 인기 글이 부족하면 전체 기간 인기 글로 대체한다")
    void getFeaturedFallsBackToAllPublishedPosts() {
        Pageable pageable = PageRequest.of(0, 2, Sort.by(Sort.Direction.DESC, "views"));
        List<Post> fallback = List.of(post("all-1"), post("all-2"));
        when(postRepository.findHotPosts(
                        any(LocalDateTime.class), org.mockito.ArgumentMatchers.eq(pageable)))
                .thenReturn(List.of(post("recent-1")));
        when(postRepository.findAllPublished(pageable)).thenReturn(fallback);

        List<Post> result = postApplicationService.getFeatured(pageable);

        assertThat(result).isEqualTo(fallback);
    }

    private static Post post(String id) {
        return Post.builder().id(id).status(Post.Status.PUBLISHED).build();
    }
}
