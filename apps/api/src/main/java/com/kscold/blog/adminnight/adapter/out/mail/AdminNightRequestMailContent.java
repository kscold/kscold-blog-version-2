package com.kscold.blog.adminnight.adapter.out.mail;

import com.kscold.blog.adminnight.domain.model.AdminNightRequest;
import com.kscold.blog.notification.adapter.out.mail.BrandedMailTemplate;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
final class AdminNightRequestMailContent {

    private final BrandedMailTemplate mailTemplate;

    String buildPreferredDetails(String label, String headline, AdminNightRequest request) {
        return buildDetails(
                label,
                headline,
                new DetailSource(
                        request.getMessage(),
                        request.getParticipationMode(),
                        request.getPreferredSlot()));
    }

    String buildScheduledDetails(String label, String headline, AdminNightRequest request) {
        return buildDetails(
                label,
                headline,
                new DetailSource(
                        request.getMessage(),
                        request.getParticipationMode(),
                        request.getScheduledSlot()));
    }

    private String buildDetails(String label, String headline, DetailSource source) {
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
                        mailTemplate.escapeHtml(source.slot().getDate().toString()),
                        mailTemplate.escapeHtml(source.slot().getWeekday()),
                        mailTemplate.escapeHtml(source.slot().getTimeLabel()),
                        mailTemplate.escapeHtml(source.slot().getFocus()),
                        mailTemplate.escapeHtml(
                                describeParticipationMode(source.participationMode())),
                        mailTemplate.escapeHtml(fallbackText(source.message(), "별도 메모 없음")));
    }

    String buildReviewNote(String label, String reviewNote) {
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

    String describeParticipationMode(AdminNightRequest.ParticipationMode participationMode) {
        if (participationMode == null) {
            return "미정";
        }

        return switch (participationMode) {
            case ONLINE -> "온라인";
            case OFFLINE -> "오프라인";
            case FLEXIBLE -> "온라인 / 오프라인 모두 가능";
        };
    }

    String fallbackText(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }

    private record DetailSource(
            String message,
            AdminNightRequest.ParticipationMode participationMode,
            AdminNightRequest.SlotInfo slot) {}
}
