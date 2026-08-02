package com.kscold.blog.social.application.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.kscold.blog.identity.domain.model.User;
import com.kscold.blog.identity.domain.port.out.UserRepository;
import com.kscold.blog.social.domain.model.FeedComment;
import com.kscold.blog.social.domain.port.out.FeedCommentRepository;
import com.kscold.blog.support.UserFixtures;
import java.time.LocalDateTime;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

@ExtendWith(MockitoExtension.class)
class FeedMentionResolverTest {

    @Mock private UserRepository userRepository;
    @Mock private FeedCommentRepository feedCommentRepository;

    private FeedMentionResolver resolver() {
        return new FeedMentionResolver(userRepository, feedCommentRepository);
    }

    private FeedComment comment(String userId) {
        return FeedComment.builder().feedId("feed-1").userId(userId).content("댓글").build();
    }

    @Test
    @DisplayName("시나리오: @displayName 이 온전한 경계로 있으면 언급으로 인식한다")
    void detectsMentionByDisplayName() {
        User gawon = UserFixtures.user("u1", User.Role.USER, "gawon", "김가원");

        List<User> mentioned = resolver().detectMentioned("@김가원 안녕하세요", List.of(gawon));

        assertThat(mentioned).containsExactly(gawon);
    }

    @Test
    @DisplayName("시나리오: 이름 뒤에 글자·숫자가 이어지면 부분 매칭이므로 언급이 아니다")
    void ignoresPartialMatch() {
        User gawon = UserFixtures.user("u1", User.Role.USER, "gawon", "김가원");

        assertThat(resolver().detectMentioned("@김가원2 님", List.of(gawon))).isEmpty();
        assertThat(resolver().detectMentioned("@김가 님", List.of(gawon))).isEmpty();
    }

    @Test
    @DisplayName("시나리오: @username 도 언급으로 인식하고, 이메일(foo@name)은 제외한다")
    void detectsUsernameButNotEmail() {
        User gawon = UserFixtures.user("u1", User.Role.USER, "gawon", "김가원");

        assertThat(resolver().detectMentioned("고마워요 @gawon!", List.of(gawon)))
                .containsExactly(gawon);
        assertThat(resolver().detectMentioned("메일 test@gawon 로", List.of(gawon))).isEmpty();
    }

    @Test
    @DisplayName("시나리오: 언급 토큰이 없으면 빈 목록을 반환한다")
    void returnsEmptyWhenNoMention() {
        User gawon = UserFixtures.user("u1", User.Role.USER, "gawon", "김가원");

        assertThat(resolver().detectMentioned("그냥 평범한 댓글", List.of(gawon))).isEmpty();
        assertThat(resolver().detectMentioned("", List.of(gawon))).isEmpty();
    }

    @Test
    @DisplayName("시나리오: 언급 대상은 관리자+댓글 참여자를 배치 조회로 모으고, 전체 컬렉션 스캔이나 반복 findById 는 쓰지 않는다")
    void mentionableUsersBatchesAdminAndCommenters() {
        User admin = UserFixtures.user("admin-1", User.Role.ADMIN, "kscold", "관리자");
        User gawon = UserFixtures.user("u1", User.Role.USER, "gawon", "김가원");
        Page<FeedComment> comments =
                new PageImpl<>(List.of(comment("admin-1"), comment("u1"), comment(null)));

        when(userRepository.findByRole(User.Role.ADMIN)).thenReturn(List.of(admin));
        when(feedCommentRepository.findByFeedId("feed-1", Pageable.unpaged())).thenReturn(comments);
        when(userRepository.findAllById(List.of("admin-1", "u1")))
                .thenReturn(List.of(admin, gawon));

        List<User> mentionable = resolver().mentionableUsers("feed-1");

        assertThat(mentionable).containsExactly(admin, gawon);
        verify(userRepository, never()).findAllOrderByCreatedAtDesc();
        verify(userRepository, never()).findById(any());
    }

    @Test
    @DisplayName("시나리오: 탈퇴한 관리자·댓글 참여자는 언급 대상에서 제외한다")
    void mentionableUsersExcludesDeletedUsers() {
        User deletedAdmin =
                User.builder()
                        .id("admin-1")
                        .username("kscold")
                        .role(User.Role.ADMIN)
                        .deletedAt(LocalDateTime.now())
                        .build();
        User gawon = UserFixtures.user("u1", User.Role.USER, "gawon", "김가원");
        Page<FeedComment> comments = new PageImpl<>(List.of(comment("u1")));

        when(userRepository.findByRole(User.Role.ADMIN)).thenReturn(List.of(deletedAdmin));
        when(feedCommentRepository.findByFeedId("feed-1", Pageable.unpaged())).thenReturn(comments);
        when(userRepository.findAllById(List.of("u1"))).thenReturn(List.of(gawon));

        assertThat(resolver().mentionableUsers("feed-1")).containsExactly(gawon);
    }
}
