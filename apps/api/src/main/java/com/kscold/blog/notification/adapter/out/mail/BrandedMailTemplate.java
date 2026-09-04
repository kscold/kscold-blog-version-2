package com.kscold.blog.notification.adapter.out.mail;

import com.kscold.blog.notification.config.MailProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/** KSCOLD 트랜잭션 메일이 공유하는 브랜드 레이아웃과 HTML 이스케이프를 제공한다. */
@Component
@RequiredArgsConstructor
public class BrandedMailTemplate {

    private final MailProperties mailProperties;

    public String render(
            String previewText,
            String title,
            String summary,
            String body,
            String detailsHtml,
            String actionUrl,
            String actionLabel) {
        String safePreview = escapeHtml(previewText);
        String safeTitle = escapeHtml(title);
        String safeSummary = escapeHtml(summary);
        String safeBody = paragraphize(body);
        String safeActionUrl = escapeHtml(actionUrl);
        String safeActionLabel = escapeHtml(actionLabel);
        String safeBrand = escapeHtml(mailProperties.getFromName());

        return """
                <!doctype html>
                <html lang="ko">
                  <head>
                    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
                    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                    <title>%s</title>
                  </head>
                  <body style="margin:0; padding:0; background-color:#F3F6FB; font-family:'Apple SD Gothic Neo','Malgun Gothic','맑은 고딕',Arial,sans-serif; color:#0F172A;">
                    <div style="display:none; max-height:0; overflow:hidden; opacity:0; mso-hide:all;">%s</div>
                    <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" border="0" style="background-color:#F3F6FB;">
                      <tr>
                        <td align="center" style="padding:32px 16px;">
                          <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" border="0" style="max-width:640px;">
                            <tr>
                              <td align="center" style="padding:0 0 16px;">
                                <span style="display:inline-block; padding:9px 16px; border-radius:999px; background-color:#E8EEF8; color:#0F172A; font-size:12px; line-height:18px; letter-spacing:0.18em; font-weight:800;">%s BLOG</span>
                              </td>
                            </tr>
                            <tr>
                              <td style="border:1px solid #E2E8F0; border-radius:28px; background-color:#FFFFFF; box-shadow:0 12px 40px rgba(15,23,42,0.08); overflow:hidden;">
                                <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" border="0">
                                  <tr>
                                    <td style="padding:36px 32px 12px;">
                                      <p style="margin:0 0 12px; font-size:12px; line-height:18px; letter-spacing:0.18em; color:#94A3B8; font-weight:700;">ACCOUNT SUPPORT</p>
                                      <h1 style="margin:0 0 14px; font-size:34px; line-height:44px; letter-spacing:-0.03em; color:#0F172A; font-weight:800;">%s</h1>
                                      <p style="margin:0; font-size:16px; line-height:28px; color:#475569;">%s</p>
                                    </td>
                                  </tr>
                                  <tr>
                                    <td style="padding:8px 32px 8px;">
                                      <p style="margin:0; font-size:15px; line-height:28px; color:#334155;">%s</p>
                                    </td>
                                  </tr>
                                  %s
                                  <tr>
                                    <td align="center" style="padding:0 32px 32px;">
                                      <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                                        <tr>
                                          <td align="center" style="border-radius:999px; background-color:#0F172A;">
                                            <a href="%s" target="_blank" style="display:inline-block; padding:15px 28px; font-size:15px; line-height:22px; font-weight:800; color:#FFFFFF; text-decoration:none;">%s</a>
                                          </td>
                                        </tr>
                                      </table>
                                    </td>
                                  </tr>
                                  <tr>
                                    <td style="padding:0 32px 28px;">
                                      <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" border="0" style="border:1px dashed #CBD5E1; border-radius:18px; background-color:#F8FAFC;">
                                        <tr>
                                          <td style="padding:18px 20px;">
                                            <p style="margin:0 0 8px; font-size:12px; line-height:18px; letter-spacing:0.14em; color:#94A3B8; font-weight:700;">DIRECT LINK</p>
                                            <p style="margin:0; font-size:14px; line-height:24px; color:#334155; word-break:break-all;">%s</p>
                                          </td>
                                        </tr>
                                      </table>
                                    </td>
                                  </tr>
                                  <tr>
                                    <td style="padding:0 32px 36px;">
                                      <p style="margin:0; font-size:13px; line-height:22px; color:#64748B;">
                                        본인이 요청하지 않았다면 이 메일은 무시하셔도 괜찮습니다. 도움이 필요하면 블로그 운영자에게 알려 주세요.
                                      </p>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding:18px 12px 0; text-align:center;">
                                <p style="margin:0; font-size:12px; line-height:20px; color:#94A3B8;">KSCOLD BLOG · 김승찬의 블로그, 일상과 기술 그리고 작업 기록을 전합니다.</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </body>
                </html>
                """
                .formatted(
                        safeTitle,
                        safePreview,
                        safeBrand,
                        safeTitle,
                        safeSummary,
                        safeBody,
                        detailsHtml,
                        safeActionUrl,
                        safeActionLabel,
                        safeActionUrl);
    }

    private String paragraphize(String text) {
        String escaped = escapeHtml(text).replace("\n", "<br />");
        return escaped;
    }

    public String escapeHtml(String value) {
        return value.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }

    public String truncateEscaped(String value, int maxLength) {
        String escaped = escapeHtml(value);
        if (escaped.length() <= maxLength) {
            return escaped;
        }
        return escaped.substring(0, maxLength - 1) + "…";
    }
}
