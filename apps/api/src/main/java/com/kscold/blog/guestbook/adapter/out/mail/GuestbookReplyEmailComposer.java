package com.kscold.blog.guestbook.adapter.out.mail;

import com.kscold.blog.identity.domain.port.out.PublicUrlResolver;
import com.kscold.blog.identity.domain.port.out.RecoveryMailMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/** 방명록 작성자에게 보낼 관리자 답글 메일을 조립한다. */
@Component
@RequiredArgsConstructor
public class GuestbookReplyEmailComposer {

    private final PublicUrlResolver urlResolver;

    public RecoveryMailMessage compose(
            String toEmail, String recipientName, String originalContent, String replyContent) {
        String url = urlResolver.resolvePublicUrl("/guestbook");
        String greeting = displayName(recipientName) + "님, 방명록에 답글이 달렸어요.";
        String plain =
                greeting
                        + "\n\n남겨주신 글\n"
                        + originalContent
                        + "\n\nKSCOLD의 답글\n"
                        + replyContent
                        + "\n\n답글 확인하기: "
                        + url;
        String html =
                """
                <div style="max-width:480px;margin:0 auto;padding:32px 24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Apple SD Gothic Neo',sans-serif;color:#111827;">
                  <h1 style="margin:0 0 8px;font-size:20px;font-weight:800;">%s</h1>
                  <p style="margin:0 0 24px;color:#6b7280;font-size:14px;">승찬님이 남겨주신 방명록을 읽고 답장했습니다.</p>
                  <p style="margin:0 0 8px;color:#9ca3af;font-size:12px;font-weight:700;">남겨주신 글</p>
                  <div style="padding:16px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;color:#4b5563;font-size:14px;line-height:1.6;white-space:pre-wrap;">%s</div>
                  <p style="margin:20px 0 8px;color:#9ca3af;font-size:12px;font-weight:700;">KSCOLD의 답글</p>
                  <div style="padding:16px;background:#111827;border-radius:12px;color:#ffffff;font-size:14px;line-height:1.6;white-space:pre-wrap;">%s</div>
                  <a href="%s" style="display:inline-block;margin-top:20px;padding:11px 20px;background:#111827;color:#ffffff;text-decoration:none;border-radius:10px;font-weight:700;font-size:14px;">답글 확인하기</a>
                  <p style="margin-top:24px;color:#9ca3af;font-size:12px;">KSCOLD · kscold.com</p>
                </div>
                """
                        .formatted(
                                escapeHtml(greeting),
                                escapeHtml(originalContent),
                                escapeHtml(replyContent),
                                url);

        return new RecoveryMailMessage(toEmail, "[KSCOLD] 방명록에 답글이 달렸어요", plain, html);
    }

    private String displayName(String recipientName) {
        return recipientName == null || recipientName.isBlank() ? "방문자" : recipientName.strip();
    }

    private String escapeHtml(String value) {
        if (value == null) {
            return "";
        }
        return value.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;");
    }
}
