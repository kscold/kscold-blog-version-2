package com.kscold.blog.adminnight.adapter.out.mail;

import com.kscold.blog.adminnight.domain.model.AdminNightRequest;
import com.kscold.blog.adminnight.domain.port.out.AdminNightRequestMailComposer;
import com.kscold.blog.notification.adapter.out.mail.BrandedMailTemplate;
import com.kscold.blog.notification.config.MailProperties;
import com.kscold.blog.notification.domain.model.MailMessage;
import org.springframework.stereotype.Component;

@Component
public class AdminNightRequestEmailComposer implements AdminNightRequestMailComposer {

    private final MailProperties mailProperties;
    private final BrandedMailTemplate mailTemplate;
    private final AdminNightRequestMailContent content;
    private final AdminNightRequestSubmissionMailFactory submissionMailFactory;

    public AdminNightRequestEmailComposer(
            MailProperties mailProperties, BrandedMailTemplate mailTemplate) {
        this.mailProperties = mailProperties;
        this.mailTemplate = mailTemplate;
        this.content = new AdminNightRequestMailContent(mailTemplate);
        this.submissionMailFactory =
                new AdminNightRequestSubmissionMailFactory(mailProperties, mailTemplate, content);
    }

    @Override
    public MailMessage buildRequestConfirmation(AdminNightRequest request) {
        return submissionMailFactory.buildRequestConfirmation(request);
    }

    @Override
    public MailMessage buildRequestNotification(AdminNightRequest request, String adminEmail) {
        return submissionMailFactory.buildRequestNotification(request, adminEmail);
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
                content.buildScheduledDetails("MERGED SLOT", request.getTaskTitle(), request);
        String plainText = buildApprovedRequesterPlainText(request, actionUrl);

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
                content.buildPreferredDetails("추가 정보 요청", request.getTaskTitle(), request)
                        + content.buildReviewNote("관리자 메모", request.getReviewNote());
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
                                content.describeParticipationMode(request.getParticipationMode()),
                                request.getPreferredSlot().getDate(),
                                request.getPreferredSlot().getWeekday(),
                                request.getPreferredSlot().getTimeLabel(),
                                request.getPreferredSlot().getFocus(),
                                content.fallbackText(request.getReviewNote(), "추가 메모 없음"),
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
                content.buildScheduledDetails(
                        "승인 완료",
                        request.getRequesterName() + " · " + request.getTaskTitle(),
                        request);
        String plainText = buildApprovedAdminPlainText(request, actionUrl);

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
        return submissionMailFactory.buildResubmittedConfirmation(request);
    }

    @Override
    public MailMessage buildResubmittedNotification(AdminNightRequest request, String adminEmail) {
        return submissionMailFactory.buildResubmittedNotification(request, adminEmail);
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
                content.buildPreferredDetails("이번 일정 보류", request.getTaskTitle(), request)
                        + content.buildReviewNote("관리자 메모", request.getReviewNote());
        String plainText = buildRejectedRequesterPlainText(request, actionUrl);

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

    private String buildApprovedRequesterPlainText(AdminNightRequest request, String actionUrl) {
        return """
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
                        content.describeParticipationMode(request.getParticipationMode()),
                        request.getScheduledSlot().getDate(),
                        request.getScheduledSlot().getWeekday(),
                        request.getScheduledSlot().getTimeLabel(),
                        request.getScheduledSlot().getFocus(),
                        content.fallbackText(request.getMessage(), "별도 메모 없음"),
                        actionUrl);
    }

    private String buildApprovedAdminPlainText(AdminNightRequest request, String actionUrl) {
        return """
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
                        content.describeParticipationMode(request.getParticipationMode()),
                        request.getScheduledSlot().getDate(),
                        request.getScheduledSlot().getWeekday(),
                        request.getScheduledSlot().getTimeLabel(),
                        request.getScheduledSlot().getFocus(),
                        actionUrl);
    }

    private String buildRejectedRequesterPlainText(AdminNightRequest request, String actionUrl) {
        return """
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
                        content.describeParticipationMode(request.getParticipationMode()),
                        request.getPreferredSlot().getDate(),
                        request.getPreferredSlot().getWeekday(),
                        request.getPreferredSlot().getTimeLabel(),
                        request.getPreferredSlot().getFocus(),
                        content.fallbackText(request.getReviewNote(), "별도 메모 없음"),
                        actionUrl);
    }
}
