package com.kscold.blog.adminnight.adapter.out.mail;

import static org.assertj.core.api.Assertions.assertThat;

import com.kscold.blog.adminnight.domain.model.AdminNightRequest;
import com.kscold.blog.notification.adapter.out.mail.BrandedMailTemplate;
import com.kscold.blog.notification.config.MailProperties;
import com.kscold.blog.notification.domain.model.MailMessage;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.Test;

class AdminNightRequestEmailComposerTest {

    @Test
    void 신청_접수_메일은_신청자_정보와_공개_링크를_안전하게_조립한다() {
        MailProperties properties = new MailProperties();
        properties.setPublicUrl("https://kscold.com/");
        AdminNightRequestEmailComposer composer =
                new AdminNightRequestEmailComposer(properties, new BrandedMailTemplate(properties));
        AdminNightRequest request =
                AdminNightRequest.builder()
                        .requesterName("류태호")
                        .requesterEmail("night@example.com")
                        .taskTitle("<밀린 문서 정리>")
                        .message("PR & 메일 정리")
                        .participationMode(AdminNightRequest.ParticipationMode.OFFLINE)
                        .preferredSlot(
                                AdminNightRequest.SlotInfo.builder()
                                        .date(LocalDate.of(2026, 9, 5))
                                        .weekday("토")
                                        .timeLabel("20:00 - 22:00")
                                        .focus("Inbox Sweep")
                                        .build())
                        .build();

        MailMessage message = composer.buildRequestConfirmation(request);

        assertThat(message.to()).isEqualTo("night@example.com");
        assertThat(message.subject()).isEqualTo("[KSCOLD] Admin Night 신청이 접수되었습니다");
        assertThat(message.plainText()).contains("류태호님", "오프라인", "https://kscold.com/admin-night");
        assertThat(message.htmlBody())
                .contains("&lt;밀린 문서 정리&gt;")
                .contains("PR &amp; 메일 정리")
                .doesNotContain("<밀린 문서 정리>");
    }

    @Test
    void 상태별_신청_메일은_신청자와_관리자에게_올바르게_조립된다() {
        MailProperties properties = new MailProperties();
        properties.setPublicUrl("https://kscold.com/");
        AdminNightRequestEmailComposer composer =
                new AdminNightRequestEmailComposer(properties, new BrandedMailTemplate(properties));
        AdminNightRequest request = completeRequest();
        String adminEmail = "admin@example.com";

        List<MailMessage> messages =
                List.of(
                        composer.buildRequestConfirmation(request),
                        composer.buildRequestNotification(request, adminEmail),
                        composer.buildApprovedForRequester(request),
                        composer.buildInfoRequestedForRequester(request),
                        composer.buildApprovedForAdmin(request, adminEmail),
                        composer.buildResubmittedConfirmation(request),
                        composer.buildResubmittedNotification(request, adminEmail),
                        composer.buildRejectedForRequester(request));

        assertThat(messages)
                .extracting(MailMessage::to)
                .containsExactly(
                        "night@example.com",
                        adminEmail,
                        "night@example.com",
                        "night@example.com",
                        adminEmail,
                        "night@example.com",
                        adminEmail,
                        "night@example.com");
        assertThat(messages)
                .allSatisfy(message -> assertThat(message.htmlBody()).contains("&lt;밀린 문서 정리&gt;"));
    }

    private AdminNightRequest completeRequest() {
        AdminNightRequest.SlotInfo preferredSlot =
                AdminNightRequest.SlotInfo.builder()
                        .date(LocalDate.of(2026, 9, 5))
                        .weekday("토")
                        .timeLabel("20:00 - 22:00")
                        .focus("Inbox Sweep")
                        .build();
        AdminNightRequest.SlotInfo scheduledSlot =
                AdminNightRequest.SlotInfo.builder()
                        .date(LocalDate.of(2026, 9, 12))
                        .weekday("토")
                        .timeLabel("19:00 - 21:00")
                        .focus("Merge Window")
                        .build();
        return AdminNightRequest.builder()
                .requesterName("류태호")
                .requesterEmail("night@example.com")
                .taskTitle("<밀린 문서 정리>")
                .message("PR & 메일 정리")
                .reviewNote("일정 확인이 필요합니다.")
                .participationMode(AdminNightRequest.ParticipationMode.OFFLINE)
                .preferredSlot(preferredSlot)
                .scheduledSlot(scheduledSlot)
                .build();
    }
}
