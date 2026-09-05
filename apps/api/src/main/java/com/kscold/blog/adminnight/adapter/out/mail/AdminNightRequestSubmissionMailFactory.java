package com.kscold.blog.adminnight.adapter.out.mail;

import com.kscold.blog.adminnight.domain.model.AdminNightRequest;
import com.kscold.blog.notification.adapter.out.mail.BrandedMailTemplate;
import com.kscold.blog.notification.config.MailProperties;
import com.kscold.blog.notification.domain.model.MailMessage;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
final class AdminNightRequestSubmissionMailFactory {

    private final MailProperties mailProperties;
    private final BrandedMailTemplate mailTemplate;
    private final AdminNightRequestMailContent content;

    MailMessage buildRequestConfirmation(AdminNightRequest request) {
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
                content.buildPreferredDetails("REQUEST RECEIVED", request.getTaskTitle(), request);
        String plainText = buildRequestConfirmationPlainText(request, actionUrl);

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

    MailMessage buildRequestNotification(AdminNightRequest request, String adminEmail) {
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
                content.buildPreferredDetails(
                                "NEW REQUEST",
                                request.getRequesterName() + " · " + request.getTaskTitle(),
                                request)
                        + buildAdminContactDetails(request);
        String plainText = buildRequestNotificationPlainText(request, actionUrl);

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

    MailMessage buildResubmittedConfirmation(AdminNightRequest request) {
        String actionUrl = mailProperties.resolvePublicUrl("/admin-night");
        String subject = "[KSCOLD] Admin Night 신청 보완본이 다시 접수되었습니다";
        String preview = request.getRequesterName() + "님의 보완된 신청을 다시 받았습니다.";
        String summary = "보완한 신청이 다시 접수되었습니다. 확인 후 승인되면 일정이 캘린더에 반영됩니다.";
        String body =
                """
                관리자 메모를 반영한 보완본이 다시 접수되었습니다.
                신청 내용과 시간대를 다시 review 한 뒤, 승인되면 실제 만남 일정으로 이어집니다.
                """;
        String details = content.buildPreferredDetails("보완본 재접수", request.getTaskTitle(), request);
        String plainText = buildResubmittedConfirmationPlainText(request, actionUrl);

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

    MailMessage buildResubmittedNotification(AdminNightRequest request, String adminEmail) {
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
                content.buildPreferredDetails(
                                "보완본 재검토",
                                request.getRequesterName() + " · " + request.getTaskTitle(),
                                request)
                        + buildAdminContactDetails(request);
        String plainText = buildResubmittedNotificationPlainText(request, actionUrl);

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

    private String buildRequestConfirmationPlainText(AdminNightRequest request, String actionUrl) {
        return """
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
                        content.describeParticipationMode(request.getParticipationMode()),
                        request.getPreferredSlot().getDate(),
                        request.getPreferredSlot().getWeekday(),
                        request.getPreferredSlot().getTimeLabel(),
                        request.getPreferredSlot().getFocus(),
                        content.fallbackText(request.getMessage(), "별도 메모 없음"),
                        actionUrl);
    }

    private String buildRequestNotificationPlainText(AdminNightRequest request, String actionUrl) {
        return """
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
                        content.describeParticipationMode(request.getParticipationMode()),
                        request.getPreferredSlot().getDate(),
                        request.getPreferredSlot().getWeekday(),
                        request.getPreferredSlot().getTimeLabel(),
                        request.getPreferredSlot().getFocus(),
                        content.fallbackText(request.getMessage(), "별도 메모 없음"),
                        actionUrl);
    }

    private String buildResubmittedConfirmationPlainText(
            AdminNightRequest request, String actionUrl) {
        return """
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
                        content.describeParticipationMode(request.getParticipationMode()),
                        request.getPreferredSlot().getDate(),
                        request.getPreferredSlot().getWeekday(),
                        request.getPreferredSlot().getTimeLabel(),
                        request.getPreferredSlot().getFocus(),
                        content.fallbackText(request.getMessage(), "별도 메모 없음"),
                        actionUrl);
    }

    private String buildResubmittedNotificationPlainText(
            AdminNightRequest request, String actionUrl) {
        return """
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
                        content.describeParticipationMode(request.getParticipationMode()),
                        request.getPreferredSlot().getDate(),
                        request.getPreferredSlot().getWeekday(),
                        request.getPreferredSlot().getTimeLabel(),
                        request.getPreferredSlot().getFocus(),
                        content.fallbackText(request.getMessage(), "별도 메모 없음"),
                        actionUrl);
    }

    private String buildAdminContactDetails(AdminNightRequest request) {
        return """
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
                                content.describeParticipationMode(request.getParticipationMode())));
    }
}
