package com.kscold.blog.social.application.service;

import static org.assertj.core.api.Assertions.assertThat;

import com.kscold.blog.identity.domain.model.User;
import com.kscold.blog.identity.domain.port.out.UserRepository;
import com.kscold.blog.social.domain.port.out.FeedCommentRepository;
import com.kscold.blog.support.UserFixtures;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class FeedMentionResolverTest {

    @Mock private UserRepository userRepository;
    @Mock private FeedCommentRepository feedCommentRepository;

    private FeedMentionResolver resolver() {
        return new FeedMentionResolver(userRepository, feedCommentRepository);
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
}
