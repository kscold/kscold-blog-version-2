package com.kscold.blog.adminnight.adapter.out.mail;

import static org.assertj.core.api.Assertions.assertThat;

import com.kscold.blog.adminnight.domain.model.AdminNightProgramVote;
import com.kscold.blog.notification.adapter.out.mail.BrandedMailTemplate;
import com.kscold.blog.notification.config.MailProperties;
import com.kscold.blog.notification.domain.model.MailMessage;
import java.util.List;
import org.junit.jupiter.api.Test;

class AdminNightProgramVoteEmailComposerTest {

    @Test
    void Bloom_투표_메일은_안내_이메일과_선호값을_사람이_읽을_수_있게_표현한다() {
        MailProperties properties = new MailProperties();
        AdminNightProgramVoteEmailComposer composer =
                new AdminNightProgramVoteEmailComposer(
                        properties, new BrandedMailTemplate(properties));
        AdminNightProgramVote vote =
                AdminNightProgramVote.builder()
                        .requesterName("류태호")
                        .requesterEmail("login@example.com")
                        .contactEmail("notice@example.com")
                        .contact("010-0000-0000")
                        .interestLevel(AdminNightProgramVote.InterestLevel.WANT_TO_ATTEND)
                        .preferredFormat(AdminNightProgramVote.PreferredFormat.HYBRID)
                        .preferredDays(List.of(AdminNightProgramVote.PreferredDay.SATURDAY))
                        .preferredTimes(List.of("weekend-night"))
                        .sessionStyle(AdminNightProgramVote.SessionStyle.WORKSHOP)
                        .sessionLength(AdminNightProgramVote.SessionLength.STANDARD_120)
                        .foodPreference(AdminNightProgramVote.FoodPreference.LIGHT_SNACK)
                        .interestedTopics(List.of("langgraph-workflow"))
                        .desiredTakeaways("실전 Agent 설계")
                        .build();

        MailMessage message = composer.buildProgramVoteThanks(vote);

        assertThat(message.to()).isEqualTo("notice@example.com");
        assertThat(message.plainText()).contains("듣고 싶어요", "하이브리드", "토요일", "주말 저녁", "실습 중심", "2시간");
        assertThat(message.htmlBody())
                .contains("LangGraph 워크플로우")
                .contains("https://kscold.com/admin-night/ai-agent-bloom");
    }
}
