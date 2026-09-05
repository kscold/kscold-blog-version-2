package com.kscold.blog.adminnight.adapter.out.mail;

import com.kscold.blog.adminnight.domain.model.AdminNightProgramVote;
import com.kscold.blog.adminnight.domain.port.out.AdminNightProgramVoteMailComposer;
import com.kscold.blog.notification.adapter.out.mail.BrandedMailTemplate;
import com.kscold.blog.notification.config.MailProperties;
import com.kscold.blog.notification.domain.model.MailMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AdminNightProgramVoteEmailComposer implements AdminNightProgramVoteMailComposer {

    private final MailProperties mailProperties;
    private final BrandedMailTemplate mailTemplate;

    @Override
    public MailMessage buildProgramVoteThanks(AdminNightProgramVote vote) {
        String actionUrl = mailProperties.resolvePublicUrl("/admin-night/ai-agent-bloom");
        String subject = "[KSCOLD] AI Agent Bloom 관심 투표를 잘 받았습니다";
        String preview = vote.getRequesterName() + "님의 AI Agent Bloom 관심 투표가 저장되었습니다.";
        String summary = "아직 확정 신청은 아니며, 실제 일정이 잡히면 입력해 주신 이메일로 먼저 안내드리겠습니다.";
        String body =
                """
                AI Agent Bloom에 관심을 남겨주셔서 감사합니다.
                남겨주신 요일, 진행 방식, 기대하는 내용을 기준으로 실제 강의형/네트워킹형 구성을 잡아볼게요.
                """;
        String details =
                buildAdminNightProgramVoteDetails("BLOOM SIGNAL RECEIVED", "관심 투표 저장 완료", vote);
        String plainText =
                """
                %s님, AI Agent Bloom 관심 투표를 잘 받았습니다.

                본명: %s
                안내 이메일: %s
                연락처: %s
                참여 의향: %s
                선호 형식: %s
                희망 요일: %s
                선호 시간대: %s
                세션 방식: %s
                Bloom 시간: %s
                음식/음료: %s
                얻어가고 싶은 것: %s

                아직 확정 신청은 아니며, 실제 일정이 잡히면 입력해 주신 이메일로 안내드리겠습니다.
                %s
                """
                        .formatted(
                                vote.getRequesterName(),
                                vote.getRequesterName(),
                                AdminNightProgramVoteLabels.resolveContactEmail(vote),
                                AdminNightProgramVoteLabels.fallbackText(
                                        vote.getContact(), "별도 연락처 없음"),
                                AdminNightProgramVoteLabels.describeInterestLevel(
                                        vote.getInterestLevel()),
                                AdminNightProgramVoteLabels.describePreferredFormat(
                                        vote.getPreferredFormat()),
                                AdminNightProgramVoteLabels.describePreferredDays(
                                        vote.getPreferredDays()),
                                AdminNightProgramVoteLabels.describePreferredTimes(
                                        vote.getPreferredTimes()),
                                AdminNightProgramVoteLabels.describeSessionStyle(
                                        vote.getSessionStyle()),
                                AdminNightProgramVoteLabels.describeSessionLength(
                                        vote.getSessionLength()),
                                AdminNightProgramVoteLabels.describeFoodPreference(
                                        vote.getFoodPreference()),
                                AdminNightProgramVoteLabels.fallbackText(
                                        vote.getDesiredTakeaways(), "별도 작성 없음"),
                                actionUrl);

        return new MailMessage(
                AdminNightProgramVoteLabels.resolveContactEmail(vote),
                subject,
                plainText,
                mailTemplate.render(
                        preview,
                        "관심 투표를 잘 받았습니다",
                        summary,
                        body,
                        details,
                        actionUrl,
                        "Bloom 페이지 다시 보기"));
    }

    @Override
    public MailMessage buildProgramVoteNotification(AdminNightProgramVote vote, String adminEmail) {
        String actionUrl = mailProperties.resolvePublicUrl("/admin/admin-night");
        String subject = "[KSCOLD] AI Agent Bloom 관심 투표가 도착했습니다";
        String preview = vote.getRequesterName() + "님이 AI Agent Bloom 관심 투표를 남겼습니다.";
        String summary = "새로운 Bloom 수요조사 응답입니다. 요일, 세션 방식, 기대 내용을 확인해 주세요.";
        String body =
                """
                AI Agent Bloom 관심 투표가 저장되었습니다.
                실제 일정으로 전환할 때 참고할 수 있도록 본명, 연락처, 이메일, 선호 요일과 기대 내용을 함께 남겼습니다.
                """;
        String details =
                buildAdminNightProgramVoteDetails(
                        "NEW BLOOM SIGNAL",
                        vote.getRequesterName()
                                + " · "
                                + AdminNightProgramVoteLabels.describeInterestLevel(
                                        vote.getInterestLevel()),
                        vote);
        String plainText =
                """
                AI Agent Bloom 관심 투표가 도착했습니다.

                신청자: %s
                로그인 이메일: %s
                안내 이메일: %s
                연락처: %s
                참여 의향: %s
                선호 형식: %s
                희망 요일: %s
                선호 시간대: %s
                세션 방식: %s
                Bloom 시간: %s
                음식/음료: %s
                관심 주제: %s
                얻어가고 싶은 것: %s
                메모: %s

                관리자 페이지:
                %s
                """
                        .formatted(
                                vote.getRequesterName(),
                                AdminNightProgramVoteLabels.fallbackText(
                                        vote.getRequesterEmail(), "없음"),
                                AdminNightProgramVoteLabels.resolveContactEmail(vote),
                                AdminNightProgramVoteLabels.fallbackText(
                                        vote.getContact(), "별도 연락처 없음"),
                                AdminNightProgramVoteLabels.describeInterestLevel(
                                        vote.getInterestLevel()),
                                AdminNightProgramVoteLabels.describePreferredFormat(
                                        vote.getPreferredFormat()),
                                AdminNightProgramVoteLabels.describePreferredDays(
                                        vote.getPreferredDays()),
                                AdminNightProgramVoteLabels.describePreferredTimes(
                                        vote.getPreferredTimes()),
                                AdminNightProgramVoteLabels.describeSessionStyle(
                                        vote.getSessionStyle()),
                                AdminNightProgramVoteLabels.describeSessionLength(
                                        vote.getSessionLength()),
                                AdminNightProgramVoteLabels.describeFoodPreference(
                                        vote.getFoodPreference()),
                                AdminNightProgramVoteLabels.describeInterestedTopics(
                                        vote.getInterestedTopics()),
                                AdminNightProgramVoteLabels.fallbackText(
                                        vote.getDesiredTakeaways(), "별도 작성 없음"),
                                AdminNightProgramVoteLabels.fallbackText(
                                        vote.getMessage(), "별도 메모 없음"),
                                actionUrl);

        return new MailMessage(
                adminEmail,
                subject,
                plainText,
                mailTemplate.render(
                        preview,
                        "Bloom 투표가 도착했습니다",
                        summary,
                        body,
                        details,
                        actionUrl,
                        "관리자 보드에서 확인하기"));
    }

    private String buildAdminNightProgramVoteDetails(
            String label, String headline, AdminNightProgramVote vote) {
        return """
                <tr>
                  <td style="padding:0 32px 24px;">
                    <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #BAE6FD; border-radius:20px; background-color:#F0F9FF;">
                      <tr>
                        <td style="padding:20px 22px;">
                          <p style="margin:0 0 8px; font-size:12px; line-height:18px; letter-spacing:0.18em; color:#0284C7; font-weight:700;">%s</p>
                          <p style="margin:0 0 8px; font-size:22px; line-height:30px; font-weight:800; color:#0F172A;">%s</p>
                          <p style="margin:0 0 8px; font-size:14px; line-height:24px; color:#475569;">안내 이메일: %s</p>
                          <p style="margin:0 0 8px; font-size:14px; line-height:24px; color:#475569;">연락처: %s</p>
                          <p style="margin:0 0 8px; font-size:14px; line-height:24px; color:#475569;">희망 요일: %s · 선호 시간: %s</p>
                          <p style="margin:0 0 8px; font-size:14px; line-height:24px; color:#475569;">세션: %s · %s · %s</p>
                          <p style="margin:0 0 8px; font-size:14px; line-height:24px; color:#475569;">관심 주제: %s</p>
                          <p style="margin:0; font-size:14px; line-height:24px; color:#334155;">얻어가고 싶은 것: %s</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                """
                .formatted(
                        mailTemplate.escapeHtml(label),
                        mailTemplate.escapeHtml(headline),
                        mailTemplate.escapeHtml(
                                AdminNightProgramVoteLabels.resolveContactEmail(vote)),
                        mailTemplate.escapeHtml(
                                AdminNightProgramVoteLabels.fallbackText(
                                        vote.getContact(), "별도 연락처 없음")),
                        mailTemplate.escapeHtml(
                                AdminNightProgramVoteLabels.describePreferredDays(
                                        vote.getPreferredDays())),
                        mailTemplate.escapeHtml(
                                AdminNightProgramVoteLabels.describePreferredTimes(
                                        vote.getPreferredTimes())),
                        mailTemplate.escapeHtml(
                                AdminNightProgramVoteLabels.describeSessionStyle(
                                        vote.getSessionStyle())),
                        mailTemplate.escapeHtml(
                                AdminNightProgramVoteLabels.describeSessionLength(
                                        vote.getSessionLength())),
                        mailTemplate.escapeHtml(
                                AdminNightProgramVoteLabels.describeFoodPreference(
                                        vote.getFoodPreference())),
                        mailTemplate.escapeHtml(
                                AdminNightProgramVoteLabels.describeInterestedTopics(
                                        vote.getInterestedTopics())),
                        mailTemplate.escapeHtml(
                                AdminNightProgramVoteLabels.fallbackText(
                                        vote.getDesiredTakeaways(), "별도 작성 없음")));
    }
}
