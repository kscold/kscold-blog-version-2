package com.kscold.blog.adminnight.adapter.out.mail;

import com.kscold.blog.adminnight.domain.model.AdminNightProgramVote;
import com.kscold.blog.adminnight.domain.port.out.AdminNightProgramVoteMailComposer;
import com.kscold.blog.notification.adapter.out.mail.BrandedMailTemplate;
import com.kscold.blog.notification.config.MailProperties;
import com.kscold.blog.notification.domain.model.MailMessage;
import java.util.List;
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
                                resolveProgramVoteContactEmail(vote),
                                fallbackText(vote.getContact(), "별도 연락처 없음"),
                                describeInterestLevel(vote.getInterestLevel()),
                                describePreferredFormat(vote.getPreferredFormat()),
                                describePreferredDays(vote.getPreferredDays()),
                                describePreferredTimes(vote.getPreferredTimes()),
                                describeSessionStyle(vote.getSessionStyle()),
                                describeSessionLength(vote.getSessionLength()),
                                describeFoodPreference(vote.getFoodPreference()),
                                fallbackText(vote.getDesiredTakeaways(), "별도 작성 없음"),
                                actionUrl);

        return new MailMessage(
                resolveProgramVoteContactEmail(vote),
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
                                + describeInterestLevel(vote.getInterestLevel()),
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
                                fallbackText(vote.getRequesterEmail(), "없음"),
                                resolveProgramVoteContactEmail(vote),
                                fallbackText(vote.getContact(), "별도 연락처 없음"),
                                describeInterestLevel(vote.getInterestLevel()),
                                describePreferredFormat(vote.getPreferredFormat()),
                                describePreferredDays(vote.getPreferredDays()),
                                describePreferredTimes(vote.getPreferredTimes()),
                                describeSessionStyle(vote.getSessionStyle()),
                                describeSessionLength(vote.getSessionLength()),
                                describeFoodPreference(vote.getFoodPreference()),
                                describeInterestedTopics(vote.getInterestedTopics()),
                                fallbackText(vote.getDesiredTakeaways(), "별도 작성 없음"),
                                fallbackText(vote.getMessage(), "별도 메모 없음"),
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
                        mailTemplate.escapeHtml(resolveProgramVoteContactEmail(vote)),
                        mailTemplate.escapeHtml(fallbackText(vote.getContact(), "별도 연락처 없음")),
                        mailTemplate.escapeHtml(describePreferredDays(vote.getPreferredDays())),
                        mailTemplate.escapeHtml(describePreferredTimes(vote.getPreferredTimes())),
                        mailTemplate.escapeHtml(describeSessionStyle(vote.getSessionStyle())),
                        mailTemplate.escapeHtml(describeSessionLength(vote.getSessionLength())),
                        mailTemplate.escapeHtml(describeFoodPreference(vote.getFoodPreference())),
                        mailTemplate.escapeHtml(
                                describeInterestedTopics(vote.getInterestedTopics())),
                        mailTemplate.escapeHtml(
                                fallbackText(vote.getDesiredTakeaways(), "별도 작성 없음")));
    }

    private String resolveProgramVoteContactEmail(AdminNightProgramVote vote) {
        return fallbackText(vote.getContactEmail(), vote.getRequesterEmail());
    }

    private String describeInterestLevel(AdminNightProgramVote.InterestLevel interestLevel) {
        if (interestLevel == null) {
            return "미정";
        }
        return switch (interestLevel) {
            case CURIOUS -> "목차 보고 결정";
            case WANT_TO_ATTEND -> "듣고 싶어요";
            case READY_IF_SCHEDULE_FITS -> "일정 맞으면 참여";
        };
    }

    private String describePreferredFormat(AdminNightProgramVote.PreferredFormat preferredFormat) {
        if (preferredFormat == null) {
            return "미정";
        }
        return switch (preferredFormat) {
            case ONLINE -> "온라인";
            case OFFLINE -> "오프라인";
            case HYBRID -> "하이브리드";
            case FLEXIBLE -> "상관없음";
        };
    }

    private String describeSessionStyle(AdminNightProgramVote.SessionStyle sessionStyle) {
        if (sessionStyle == null) {
            return "섞어서";
        }
        return switch (sessionStyle) {
            case LECTURE -> "강의 중심";
            case WORKSHOP -> "실습 중심";
            case NETWORKING -> "네트워킹 중심";
            case MIXED -> "섞어서";
        };
    }

    private String describeSessionLength(AdminNightProgramVote.SessionLength sessionLength) {
        if (sessionLength == null) {
            return "2시간";
        }
        return switch (sessionLength) {
            case SHORT_90 -> "90분";
            case STANDARD_120 -> "2시간";
            case HALF_DAY -> "반나절";
            case SERIES -> "짧은 연속 세션";
        };
    }

    private String describeFoodPreference(AdminNightProgramVote.FoodPreference foodPreference) {
        if (foodPreference == null) {
            return "가벼운 간식";
        }
        return switch (foodPreference) {
            case NO_NEED -> "없어도 됨";
            case DRINKS_ONLY -> "음료 정도";
            case LIGHT_SNACK -> "가벼운 간식";
            case MEAL -> "식사도 원함";
        };
    }

    private String describePreferredDays(List<AdminNightProgramVote.PreferredDay> preferredDays) {
        if (preferredDays == null || preferredDays.isEmpty()) {
            return "토요일, 일요일";
        }
        return String.join(", ", preferredDays.stream().map(this::describePreferredDay).toList());
    }

    private String describePreferredDay(AdminNightProgramVote.PreferredDay preferredDay) {
        if (preferredDay == null) {
            return "미정";
        }
        return switch (preferredDay) {
            case FRIDAY -> "금요일";
            case SATURDAY -> "토요일";
            case SUNDAY -> "일요일";
        };
    }

    private String describePreferredTimes(List<String> preferredTimes) {
        if (preferredTimes == null || preferredTimes.isEmpty()) {
            return "미정";
        }
        return String.join(", ", preferredTimes.stream().map(this::describePreferredTime).toList());
    }

    private String describePreferredTime(String preferredTime) {
        if (preferredTime == null) {
            return "미정";
        }
        return switch (preferredTime) {
            case "weekday-night" -> "평일 저녁";
            case "friday-night" -> "금요일 밤";
            case "weekend-day" -> "주말 낮";
            case "weekend-night" -> "주말 저녁";
            default -> preferredTime;
        };
    }

    private String describeInterestedTopics(List<String> interestedTopics) {
        if (interestedTopics == null || interestedTopics.isEmpty()) {
            return "미정";
        }
        return String.join(
                ", ", interestedTopics.stream().map(this::describeInterestedTopic).toList());
    }

    private String describeInterestedTopic(String interestedTopic) {
        if (interestedTopic == null) {
            return "미정";
        }
        return switch (interestedTopic) {
            case "agent-methodology" -> "Agent 설계 방법론";
            case "langgraph-workflow" -> "LangGraph 워크플로우";
            case "tool-rag-memory" -> "Tool · RAG · Memory";
            case "evaluation-observability" -> "평가와 관측";
            case "production-ops" -> "실전 적용";
            default -> interestedTopic;
        };
    }

    private String fallbackText(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }
}
