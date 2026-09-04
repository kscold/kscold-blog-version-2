package com.kscold.blog.chat.adapter.out.mail;

import com.kscold.blog.chat.domain.port.out.ChatReminderMailComposer;
import com.kscold.blog.notification.adapter.out.mail.BrandedMailTemplate;
import com.kscold.blog.notification.domain.model.MailMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ChatReminderEmailComposer implements ChatReminderMailComposer {

    private final BrandedMailTemplate mailTemplate;

    @Override
    public MailMessage buildUnreadReminder(
            String recipientEmail,
            String recipientName,
            String adminName,
            String latestContent,
            long unreadCount,
            String actionUrl) {
        String subject = "[KSCOLD] 새 답장이 도착했습니다";
        String preview = "관리자가 남긴 답장이 아직 확인되지 않았습니다.";
        String summary = "채팅에 새 답장이 있어요. 아래에서 바로 확인할 수 있습니다.";
        String body =
                """
                관리자가 남긴 새 답장이 아직 읽히지 않아 한 번 더 알려드립니다.
                답장이 쌓이기 전에 아래 버튼으로 들어와 이어서 확인해 주세요.
                """;
        String details =
                """
                <tr>
                  <td style="padding:0 32px 24px;">
                    <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #E2E8F0; border-radius:20px; background-color:#F8FAFC;">
                      <tr>
                        <td style="padding:20px 22px;">
                          <p style="margin:0 0 8px; font-size:12px; line-height:18px; letter-spacing:0.18em; color:#94A3B8; font-weight:700;">CHAT UPDATE</p>
                          <p style="margin:0 0 8px; font-size:14px; line-height:24px; color:#475569;">최근 답장</p>
                          <p style="margin:0 0 12px; font-size:20px; line-height:30px; font-weight:800; color:#0F172A;">%s님의 새 답장 %d건</p>
                          <p style="margin:0; font-size:14px; line-height:24px; color:#64748B;">%s</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                """
                        .formatted(
                                mailTemplate.escapeHtml(adminName),
                                unreadCount,
                                mailTemplate.truncateEscaped(latestContent, 140));

        String plainText =
                """
                %s님, 관리자가 남긴 새 답장 %d건이 아직 확인되지 않았습니다.

                최근 답장:
                %s

                채팅 열기:
                %s
                """
                        .formatted(recipientName, unreadCount, latestContent, actionUrl);

        return new MailMessage(
                recipientEmail,
                subject,
                plainText,
                mailTemplate.render(
                        preview, "새 답장을 확인해 주세요", summary, body, details, actionUrl, "채팅 확인하기"));
    }
}
