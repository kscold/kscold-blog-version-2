package com.kscold.blog.adminnight.adapter.out.mail;

import static org.assertj.core.api.Assertions.assertThat;

import com.kscold.blog.adminnight.domain.model.AdminNightProgramVote;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class AdminNightProgramVoteLabelsTest {

    @Test
    @DisplayName("선택값이 없으면 메일에 사용할 기본 문구를 반환한다")
    void describesMissingSelectionsWithDefaults() {
        assertThat(
                        List.of(
                                AdminNightProgramVoteLabels.describeInterestLevel(null),
                                AdminNightProgramVoteLabels.describePreferredFormat(null),
                                AdminNightProgramVoteLabels.describeSessionStyle(null),
                                AdminNightProgramVoteLabels.describeSessionLength(null),
                                AdminNightProgramVoteLabels.describeFoodPreference(null),
                                AdminNightProgramVoteLabels.describePreferredDays(null),
                                AdminNightProgramVoteLabels.describePreferredTimes(List.of()),
                                AdminNightProgramVoteLabels.describeInterestedTopics(List.of())))
                .containsExactly("미정", "미정", "섞어서", "2시간", "가벼운 간식", "토요일, 일요일", "미정", "미정");
    }

    @Test
    @DisplayName("알려진 코드값은 한글로 바꾸고 새 코드값은 그대로 보존한다")
    void describesKnownAndCustomCodes() {
        assertThat(
                        List.of(
                                AdminNightProgramVoteLabels.describePreferredTimes(
                                        List.of("weekend-night", "custom-time")),
                                AdminNightProgramVoteLabels.describeInterestedTopics(
                                        List.of("langgraph-workflow", "custom-topic"))))
                .containsExactly("주말 저녁, custom-time", "LangGraph 워크플로우, custom-topic");
    }

    @Test
    @DisplayName("안내 이메일이 비어 있으면 로그인 이메일을 사용한다")
    void resolvesRequesterEmailAsFallback() {
        AdminNightProgramVote vote =
                AdminNightProgramVote.builder()
                        .requesterEmail("login@example.com")
                        .contactEmail(" ")
                        .build();

        assertThat(AdminNightProgramVoteLabels.resolveContactEmail(vote))
                .isEqualTo("login@example.com");
    }
}
