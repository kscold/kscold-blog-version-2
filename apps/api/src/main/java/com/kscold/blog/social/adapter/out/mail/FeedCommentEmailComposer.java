package com.kscold.blog.social.adapter.out.mail;

import com.kscold.blog.identity.domain.port.out.PublicUrlResolver;
import com.kscold.blog.identity.domain.port.out.RecoveryMailMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/** 피드 댓글 알림 메일(주인 알림 / 언급 알림) HTML·본문을 조립함. */
@Component
@RequiredArgsConstructor
public class FeedCommentEmailComposer {

    private final PublicUrlResolver urlResolver;

    /** 새 댓글이 달렸음을 블로그 주인(admin)에게 알림. */
    public RecoveryMailMessage adminNewComment(
            String toEmail, String authorName, String content, String feedId, String postPreview) {
        String url = urlResolver.resolvePublicUrl("/feed/" + feedId);
        return build(
                toEmail,
                "[KSCOLD] 새 댓글이 달렸어요",
                authorName + "님이 댓글을 남겼어요",
                authorName,
                content,
                postPreview,
                url,
                "댓글 보러 가기");
    }

    /** 댓글에서 언급된 사용자에게 알림. */
    public RecoveryMailMessage mention(
            String toEmail, String authorName, String content, String feedId, String postPreview) {
        String url = urlResolver.resolvePublicUrl("/feed/" + feedId);
        return build(
                toEmail,
                "[KSCOLD] " + authorName + "님이 회원님을 언급했어요",
                authorName + "님이 댓글에서 회원님을 언급했어요",
                authorName,
                content,
                postPreview,
                url,
                "댓글 확인하기");
    }

    private RecoveryMailMessage build(
            String toEmail,
            String subject,
            String heading,
            String authorName,
            String content,
            String postPreview,
            String url,
            String actionLabel) {

        String previewLine =
                postPreview == null || postPreview.isBlank()
                        ? ""
                        : "글: " + postPreview.strip() + "\n";

        String plain =
                heading
                        + "\n\n"
                        + previewLine
                        + authorName
                        + ": "
                        + content
                        + "\n\n"
                        + actionLabel
                        + ": "
                        + url;

        String previewHtml =
                postPreview == null || postPreview.isBlank()
                        ? ""
                        : "<p style=\"margin:0 0 12px;color:#6b7280;font-size:13px;\">글: "
                                + escapeHtml(postPreview.strip())
                                + "</p>";

        String html =
                """
                <div style="max-width:480px;margin:0 auto;padding:32px 24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Apple SD Gothic Neo',sans-serif;color:#111827;">
                  <h1 style="margin:0 0 16px;font-size:18px;font-weight:800;">%s</h1>
                  %s
                  <div style="padding:16px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;">
                    <p style="margin:0 0 4px;font-weight:700;font-size:14px;">%s</p>
                    <p style="margin:0;white-space:pre-wrap;line-height:1.6;font-size:14px;color:#374151;">%s</p>
                  </div>
                  <a href="%s" style="display:inline-block;margin-top:20px;padding:11px 20px;background:#111827;color:#ffffff;text-decoration:none;border-radius:10px;font-weight:700;font-size:14px;">%s</a>
                  <p style="margin-top:24px;color:#9ca3af;font-size:12px;">KSCOLD · kscold.com</p>
                </div>
                """
                        .formatted(
                                escapeHtml(heading),
                                previewHtml,
                                escapeHtml(authorName),
                                escapeHtml(content),
                                url,
                                escapeHtml(actionLabel));

        return new RecoveryMailMessage(toEmail, subject, plain, html);
    }

    private String escapeHtml(String value) {
        if (value == null) return "";
        return value.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;");
    }
}
