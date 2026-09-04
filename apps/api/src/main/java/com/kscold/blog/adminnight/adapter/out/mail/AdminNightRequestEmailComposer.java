package com.kscold.blog.adminnight.adapter.out.mail;

import com.kscold.blog.adminnight.domain.model.AdminNightRequest;
import com.kscold.blog.adminnight.domain.port.out.AdminNightRequestMailComposer;
import com.kscold.blog.notification.adapter.out.mail.BrandedMailTemplate;
import com.kscold.blog.notification.config.MailProperties;
import com.kscold.blog.notification.domain.model.MailMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AdminNightRequestEmailComposer implements AdminNightRequestMailComposer {

    private final MailProperties mailProperties;
    private final BrandedMailTemplate mailTemplate;

    @Override
    public MailMessage buildRequestConfirmation(AdminNightRequest request) {
        String actionUrl = mailProperties.resolvePublicUrl("/admin-night");
        String subject = "[KSCOLD] Admin Night 신청이 접수되었습니다";
        String preview = request.getRequesterName() + "님의 Admin Night 신청을 잘 받았습니다.";
        String summary = "신청 PR이 도착했습니다. 확인 후 승인되면 merge / meet 일정으로 이어집니다.";
        String body =
                """
                미뤄둔 일을 끝내기 위한 Admin Night 신청이 접수되었습니다.
                승인 전까지는 대기 상태로 두고, 확인이 끝나면 일정 슬롯과 함께 실제 만남 안내를 보내드릴게요.
                """;
        String details =
                buildAdminNightDetails(
                        "REQUEST RECEIVED",
                        request.getTaskTitle(),
                        request.getMessage(),
                        request.getParticipationMode(),
                        request.getPreferredSlot());
        String plainText =
                """
                %s님, Admin Night 신청이 접수되었습니다.

                실명: %s
                끝낼 일: %s
                진행 방식: %s
                희망 시간: %s %s / %s / %s
                메모: %s

                승인 여부와 일정은 아래 페이지에서 확인할 수 있습니다.
                %s
                """
                        .formatted(
                                request.getRequesterName(),
                                request.getRequesterName(),
                                request.getTaskTitle(),
                                describeParticipationMode(request.getParticipationMode()),
                                request.getPreferredSlot().getDate(),
                                request.getPreferredSlot().getWeekday(),
                                request.getPreferredSlot().getTimeLabel(),
                                request.getPreferredSlot().getFocus(),
                                fallbackText(request.getMessage(), "별도 메모 없음"),
                                actionUrl);

        return new MailMessage(
                request.getRequesterEmail(),
                subject,
                plainText,
                mailTemplate.render(
                        preview,
                        "신청 PR을 잘 받았습니다",
                        summary,
                        body,
                        details,
                        actionUrl,
                        "Admin Night 페이지 보기"));
    }

    @Override
    public MailMessage buildRequestNotification(AdminNightRequest request, String adminEmail) {
        String actionUrl = mailProperties.resolvePublicUrl("/admin/admin-night");
        String subject = "[KSCOLD] 새로운 Admin Night 신청이 도착했습니다";
        String preview = request.getRequesterName() + "님이 이번 Admin Night에 함께 붙고 싶다는 신청을 보냈습니다.";
        String summary = "새로운 신청이 도착했습니다. 시간과 의지를 리뷰한 뒤 승인하면 일정이 보드에 반영됩니다.";
        String body =
                """
                새로운 Admin Night 신청이 도착했습니다.
                신청 내용을 확인하고 승인하면 공개 캘린더와 참가자 메일에 바로 일정이 반영됩니다.
                """;
        String details =
                buildAdminNightDetails(
                                "NEW REQUEST",
                                request.getRequesterName() + " · " + request.getTaskTitle(),
                                request.getMessage(),
                                request.getParticipationMode(),
                                request.getPreferredSlot())
                        + """
                <tr>
                  <td style="padding:0 32px 24px;">
                    <p style="margin:0 0 8px; font-size:14px; line-height:24px; color:#64748B;">신청자 이메일: %s</p>
                    <p style="margin:0; font-size:14px; line-height:24px; color:#64748B;">진행 방식: %s</p>
                  </td>
                </tr>
                """
                                .formatted(
                                        mailTemplate.escapeHtml(request.getRequesterEmail()),
                                        mailTemplate.escapeHtml(
                                                describeParticipationMode(
                                                        request.getParticipationMode())));
        String plainText =
                """
                새로운 Admin Night 신청이 도착했습니다.

                신청자: %s (%s)
                끝낼 일: %s
                진행 방식: %s
                희망 시간: %s %s / %s / %s
                메모: %s

                관리자 페이지:
                %s
                """
                        .formatted(
                                request.getRequesterName(),
                                request.getRequesterEmail(),
                                request.getTaskTitle(),
                                describeParticipationMode(request.getParticipationMode()),
                                request.getPreferredSlot().getDate(),
                                request.getPreferredSlot().getWeekday(),
                                request.getPreferredSlot().getTimeLabel(),
                                request.getPreferredSlot().getFocus(),
                                fallbackText(request.getMessage(), "별도 메모 없음"),
                                actionUrl);

        return new MailMessage(
                adminEmail,
                subject,
                plainText,
                mailTemplate.render(
                        preview,
                        "새로운 신청 PR이 도착했습니다",
                        summary,
                        body,
                        details,
                        actionUrl,
                        "관리자 보드에서 확인하기"));
    }

    @Override
    public MailMessage buildApprovedForRequester(AdminNightRequest request) {
        String actionUrl = mailProperties.resolvePublicUrl("/admin-night");
        String subject = "[KSCOLD] Admin Night 일정이 merge 되었습니다";
        String preview = request.getRequesterName() + "님의 Admin Night 신청이 승인되었습니다.";
        String summary = "승인이 완료되어 일정이 공개 보드에 반영되었습니다. 같은 시간대에 조용히 붙어 끝내면 됩니다.";
        String body =
                """
                Admin Night 신청이 승인되었습니다.
                공개 보드에도 같은 일정이 반영되었고, 아래 시간대에 맞춰 그대로 merge / meet, 즉 실제 만남 흐름으로 이어가면 됩니다.
                """;
        String details =
                buildAdminNightDetails(
                        "MERGED SLOT",
                        request.getTaskTitle(),
                        request.getMessage(),
                        request.getParticipationMode(),
                        request.getScheduledSlot());
        String plainText =
                """
                %s님, Admin Night 신청이 승인되었습니다.

                실명: %s
                끝낼 일: %s
                진행 방식: %s
                확정 시간: %s %s / %s / %s
                메모: %s

                페이지에서 보드와 안내를 다시 확인할 수 있습니다.
                %s
                """
                        .formatted(
                                request.getRequesterName(),
                                request.getRequesterName(),
                                request.getTaskTitle(),
                                describeParticipationMode(request.getParticipationMode()),
                                request.getScheduledSlot().getDate(),
                                request.getScheduledSlot().getWeekday(),
                                request.getScheduledSlot().getTimeLabel(),
                                request.getScheduledSlot().getFocus(),
                                fallbackText(request.getMessage(), "별도 메모 없음"),
                                actionUrl);

        return new MailMessage(
                request.getRequesterEmail(),
                subject,
                plainText,
                mailTemplate.render(
                        preview,
                        "일정이 merge 되었습니다",
                        summary,
                        body,
                        details,
                        actionUrl,
                        "보드에서 일정 확인하기"));
    }

    @Override
    public MailMessage buildInfoRequestedForRequester(AdminNightRequest request) {
        String actionUrl = mailProperties.resolvePublicUrl("/admin-night");
        String subject = "[KSCOLD] Admin Night 신청에 추가 정보가 필요합니다";
        String preview = request.getRequesterName() + "님의 신청을 확인했고, 조금 더 알고 싶은 내용이 있습니다.";
        String summary = "관리자 메모를 확인하고 같은 신청을 보완해 다시 보내주세요. 보완본이 도착하면 다시 review 합니다.";
        String body =
                """
                Admin Night 신청을 잘 확인했습니다.
                다만 실제 만남으로 이어가기 전에 조금 더 알고 싶은 정보가 있어, 아래 메모를 남겨 두었습니다.
                """;
        String details =
                buildAdminNightDetails(
                                "추가 정보 요청",
                                request.getTaskTitle(),
                                request.getMessage(),
                                request.getParticipationMode(),
                                request.getPreferredSlot())
                        + buildAdminNightReviewNote("관리자 메모", request.getReviewNote());
        String plainText =
                """
                %s님, Admin Night 신청에 추가 정보가 필요합니다.

                실명: %s
                끝낼 일: %s
                진행 방식: %s
                희망 시간: %s %s / %s / %s
                관리자 메모: %s

                아래 페이지에서 내용을 보완해 다시 보내주세요.
                %s
                """
                        .formatted(
                                request.getRequesterName(),
                                request.getRequesterName(),
                                request.getTaskTitle(),
                                describeParticipationMode(request.getParticipationMode()),
                                request.getPreferredSlot().getDate(),
                                request.getPreferredSlot().getWeekday(),
                                request.getPreferredSlot().getTimeLabel(),
                                request.getPreferredSlot().getFocus(),
                                fallbackText(request.getReviewNote(), "추가 메모 없음"),
                                actionUrl);

        return new MailMessage(
                request.getRequesterEmail(),
                subject,
                plainText,
                mailTemplate.render(
                        preview, "추가 정보가 필요합니다", summary, body, details, actionUrl, "신청 보완하기"));
    }

    @Override
    public MailMessage buildApprovedForAdmin(AdminNightRequest request, String adminEmail) {
        String actionUrl = mailProperties.resolvePublicUrl("/admin/admin-night");
        String subject = "[KSCOLD] Admin Night 일정 승인이 반영되었습니다";
        String preview = request.getRequesterName() + "님 일정이 보드에 반영되었습니다.";
        String summary = "승인된 신청이 캘린더에 반영되었습니다. 같은 시간대에 실제 만남 흐름으로 이어가면 됩니다.";
        String body =
                """
                승인한 Admin Night 신청이 일정에 반영되었습니다.
                공개 캘린더와 참가자 안내 메일까지 함께 반영되었으니, 필요한 경우 여기서 다시 확인해 주세요.
                """;
        String details =
                buildAdminNightDetails(
                        "승인 완료",
                        request.getRequesterName() + " · " + request.getTaskTitle(),
                        request.getMessage(),
                        request.getParticipationMode(),
                        request.getScheduledSlot());
        String plainText =
                """
                승인 완료된 Admin Night 일정입니다.

                신청자: %s (%s)
                끝낼 일: %s
                진행 방식: %s
                확정 시간: %s %s / %s / %s

                관리자 페이지:
                %s
                """
                        .formatted(
                                request.getRequesterName(),
                                request.getRequesterEmail(),
                                request.getTaskTitle(),
                                describeParticipationMode(request.getParticipationMode()),
                                request.getScheduledSlot().getDate(),
                                request.getScheduledSlot().getWeekday(),
                                request.getScheduledSlot().getTimeLabel(),
                                request.getScheduledSlot().getFocus(),
                                actionUrl);

        return new MailMessage(
                adminEmail,
                subject,
                plainText,
                mailTemplate.render(
                        preview,
                        "승인한 일정이 보드에 올라갔습니다",
                        summary,
                        body,
                        details,
                        actionUrl,
                        "관리자 보드 다시 보기"));
    }

    @Override
    public MailMessage buildResubmittedConfirmation(AdminNightRequest request) {
        String actionUrl = mailProperties.resolvePublicUrl("/admin-night");
        String subject = "[KSCOLD] Admin Night 신청 보완본이 다시 접수되었습니다";
        String preview = request.getRequesterName() + "님의 보완된 신청을 다시 받았습니다.";
        String summary = "보완한 신청이 다시 접수되었습니다. 확인 후 승인되면 일정이 캘린더에 반영됩니다.";
        String body =
                """
                관리자 메모를 반영한 보완본이 다시 접수되었습니다.
                신청 내용과 시간대를 다시 review 한 뒤, 승인되면 실제 만남 일정으로 이어집니다.
                """;
        String details =
                buildAdminNightDetails(
                        "보완본 재접수",
                        request.getTaskTitle(),
                        request.getMessage(),
                        request.getParticipationMode(),
                        request.getPreferredSlot());
        String plainText =
                """
                %s님, 보완한 Admin Night 신청이 다시 접수되었습니다.

                실명: %s
                끝낼 일: %s
                진행 방식: %s
                희망 시간: %s %s / %s / %s
                메모: %s

                신청 상태는 아래 페이지에서 계속 확인할 수 있습니다.
                %s
                """
                        .formatted(
                                request.getRequesterName(),
                                request.getRequesterName(),
                                request.getTaskTitle(),
                                describeParticipationMode(request.getParticipationMode()),
                                request.getPreferredSlot().getDate(),
                                request.getPreferredSlot().getWeekday(),
                                request.getPreferredSlot().getTimeLabel(),
                                request.getPreferredSlot().getFocus(),
                                fallbackText(request.getMessage(), "별도 메모 없음"),
                                actionUrl);

        return new MailMessage(
                request.getRequesterEmail(),
                subject,
                plainText,
                mailTemplate.render(
                        preview,
                        "보완한 신청을 다시 받았습니다",
                        summary,
                        body,
                        details,
                        actionUrl,
                        "신청 상태 다시 보기"));
    }

    @Override
    public MailMessage buildResubmittedNotification(AdminNightRequest request, String adminEmail) {
        String actionUrl = mailProperties.resolvePublicUrl("/admin/admin-night");
        String subject = "[KSCOLD] Admin Night 신청 보완본이 도착했습니다";
        String preview = request.getRequesterName() + "님이 추가 정보를 반영한 보완본을 다시 보냈습니다.";
        String summary = "보완된 신청이 다시 대기열에 올라왔습니다. 확인 후 승인하거나 필요한 경우 메모를 남겨 다시 요청할 수 있습니다.";
        String body =
                """
                추가 정보를 요청했던 Admin Night 신청의 보완본이 도착했습니다.
                관리자 보드에서 내용을 다시 확인하고, 승인하거나 필요한 경우 메모를 남겨 다시 요청할 수 있습니다.
                """;
        String details =
                buildAdminNightDetails(
                                "보완본 재검토",
                                request.getRequesterName() + " · " + request.getTaskTitle(),
                                request.getMessage(),
                                request.getParticipationMode(),
                                request.getPreferredSlot())
                        + """
                <tr>
                  <td style="padding:0 32px 24px;">
                    <p style="margin:0 0 8px; font-size:14px; line-height:24px; color:#64748B;">신청자 이메일: %s</p>
                    <p style="margin:0; font-size:14px; line-height:24px; color:#64748B;">진행 방식: %s</p>
                  </td>
                </tr>
                """
                                .formatted(
                                        mailTemplate.escapeHtml(request.getRequesterEmail()),
                                        mailTemplate.escapeHtml(
                                                describeParticipationMode(
                                                        request.getParticipationMode())));
        String plainText =
                """
                Admin Night 신청 보완본이 도착했습니다.

                신청자: %s (%s)
                끝낼 일: %s
                진행 방식: %s
                희망 시간: %s %s / %s / %s
                메모: %s

                관리자 페이지:
                %s
                """
                        .formatted(
                                request.getRequesterName(),
                                request.getRequesterEmail(),
                                request.getTaskTitle(),
                                describeParticipationMode(request.getParticipationMode()),
                                request.getPreferredSlot().getDate(),
                                request.getPreferredSlot().getWeekday(),
                                request.getPreferredSlot().getTimeLabel(),
                                request.getPreferredSlot().getFocus(),
                                fallbackText(request.getMessage(), "별도 메모 없음"),
                                actionUrl);

        return new MailMessage(
                adminEmail,
                subject,
                plainText,
                mailTemplate.render(
                        preview,
                        "보완본이 다시 도착했습니다",
                        summary,
                        body,
                        details,
                        actionUrl,
                        "관리자 보드에서 다시 보기"));
    }

    @Override
    public MailMessage buildRejectedForRequester(AdminNightRequest request) {
        String actionUrl = mailProperties.resolvePublicUrl("/admin-night");
        String subject = "[KSCOLD] Admin Night 신청 상태를 안내드립니다";
        String preview = request.getRequesterName() + "님의 이번 신청은 이번 슬롯에 바로 반영되지 않았습니다.";
        String summary = "이번 신청은 바로 일정으로 연결되지 않았습니다. 다음 슬롯에 맞춰 다시 가볍게 PR을 보내도 괜찮습니다.";
        String body =
                """
                이번 신청은 현재 일정에 바로 반영되지는 않았습니다.
                그래도 Admin Night 문화 페이지는 계속 열려 있으니, 다음 시간대에 맞춰 다시 신청해도 괜찮습니다.
                """;
        String details =
                buildAdminNightDetails(
                                "이번 일정 보류",
                                request.getTaskTitle(),
                                request.getMessage(),
                                request.getParticipationMode(),
                                request.getPreferredSlot())
                        + buildAdminNightReviewNote("관리자 메모", request.getReviewNote());
        String plainText =
                """
                %s님, 이번 Admin Night 신청은 현재 일정에 바로 반영되지 않았습니다.

                실명: %s
                끝낼 일: %s
                진행 방식: %s
                희망 시간: %s %s / %s / %s
                관리자 메모: %s

                다음 슬롯에 다시 신청하려면 아래 페이지를 확인해 주세요.
                %s
                """
                        .formatted(
                                request.getRequesterName(),
                                request.getRequesterName(),
                                request.getTaskTitle(),
                                describeParticipationMode(request.getParticipationMode()),
                                request.getPreferredSlot().getDate(),
                                request.getPreferredSlot().getWeekday(),
                                request.getPreferredSlot().getTimeLabel(),
                                request.getPreferredSlot().getFocus(),
                                fallbackText(request.getReviewNote(), "별도 메모 없음"),
                                actionUrl);

        return new MailMessage(
                request.getRequesterEmail(),
                subject,
                plainText,
                mailTemplate.render(
                        preview,
                        "이번 신청은 보류되었습니다",
                        summary,
                        body,
                        details,
                        actionUrl,
                        "다음 슬롯 다시 보기"));
    }

    private String buildAdminNightDetails(
            String label,
            String headline,
            String message,
            AdminNightRequest.ParticipationMode participationMode,
            AdminNightRequest.SlotInfo slot) {
        return """
                <tr>
                  <td style="padding:0 32px 24px;">
                    <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #E2E8F0; border-radius:20px; background-color:#F8FAFC;">
                      <tr>
                        <td style="padding:20px 22px;">
                          <p style="margin:0 0 8px; font-size:12px; line-height:18px; letter-spacing:0.18em; color:#94A3B8; font-weight:700;">%s</p>
                          <p style="margin:0 0 8px; font-size:22px; line-height:30px; font-weight:800; color:#0F172A;">%s</p>
                          <p style="margin:0 0 10px; font-size:14px; line-height:24px; color:#475569;">%s %s · %s · %s</p>
                          <p style="margin:0 0 10px; font-size:14px; line-height:24px; color:#475569;">진행 방식: %s</p>
                          <p style="margin:0; font-size:14px; line-height:24px; color:#64748B;">%s</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                """
                .formatted(
                        mailTemplate.escapeHtml(label),
                        mailTemplate.escapeHtml(headline),
                        mailTemplate.escapeHtml(slot.getDate().toString()),
                        mailTemplate.escapeHtml(slot.getWeekday()),
                        mailTemplate.escapeHtml(slot.getTimeLabel()),
                        mailTemplate.escapeHtml(slot.getFocus()),
                        mailTemplate.escapeHtml(describeParticipationMode(participationMode)),
                        mailTemplate.escapeHtml(fallbackText(message, "별도 메모 없음")));
    }

    private String buildAdminNightReviewNote(String label, String reviewNote) {
        if (reviewNote == null || reviewNote.isBlank()) {
            return "";
        }

        return """
                <tr>
                  <td style="padding:0 32px 24px;">
                    <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #FED7AA; border-radius:20px; background-color:#FFF7ED;">
                      <tr>
                        <td style="padding:20px 22px;">
                          <p style="margin:0 0 8px; font-size:12px; line-height:18px; letter-spacing:0.18em; color:#C2410C; font-weight:700;">%s</p>
                          <p style="margin:0; font-size:14px; line-height:24px; color:#7C2D12;">%s</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                """
                .formatted(mailTemplate.escapeHtml(label), mailTemplate.escapeHtml(reviewNote));
    }

    private String describeParticipationMode(
            AdminNightRequest.ParticipationMode participationMode) {
        if (participationMode == null) {
            return "미정";
        }

        return switch (participationMode) {
            case ONLINE -> "온라인";
            case OFFLINE -> "오프라인";
            case FLEXIBLE -> "온라인 / 오프라인 모두 가능";
        };
    }

    private String fallbackText(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }
}
