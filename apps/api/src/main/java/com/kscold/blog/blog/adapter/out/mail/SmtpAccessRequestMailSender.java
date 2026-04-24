package com.kscold.blog.blog.adapter.out.mail;

import com.kscold.blog.blog.application.port.out.AccessRequestMailSender;
import com.kscold.blog.blog.domain.model.AccessRequest;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.nio.charset.StandardCharsets;

@Slf4j
@Component
@RequiredArgsConstructor
public class SmtpAccessRequestMailSender implements AccessRequestMailSender {

    private final ObjectProvider<JavaMailSender> mailSenderProvider;

    @Value("${spring.mail.host:}")
    private String mailHost;

    @Value("${account-recovery.from-address:}")
    private String fromAddress;

    @Value("${account-recovery.from-name:KSCOLD}")
    private String fromName;

    @Value("${account-recovery.public-url:https://kscold.com}")
    private String publicUrl;

    @Override
    public boolean isAvailable() {
        return StringUtils.hasText(mailHost)
                && StringUtils.hasText(fromAddress)
                && mailSenderProvider.getIfAvailable() != null;
    }

    @Override
    public void sendApproved(String toEmail, String displayName, AccessRequest request) {
        if (!isAvailable() || !StringUtils.hasText(toEmail)) return;

        String base = StringUtils.trimTrailingCharacter(publicUrl.trim(), '/');
        String postUrl = StringUtils.hasText(request.getPostSlug())
                ? base + "/blog/" + request.getPostSlug()
                : base + "/blog";

        String target = request.getGrantScope() == AccessRequest.GrantScope.CATEGORY
                ? ("[" + safe(request.getCategoryName()) + "] 카테고리 전체")
                : ("「" + safe(request.getPostTitle()) + "」 글");

        String subject = "[KSCOLD] 열람 요청이 승인되었습니다";
        String plain = displayName + "님, 요청하신 " + target + " 열람이 승인되었습니다.\n"
                + "아래 링크에서 바로 확인하실 수 있습니다.\n" + postUrl;
        String html = buildHtml(displayName, target, postUrl);

        try {
            JavaMailSender sender = mailSenderProvider.getObject();
            MimeMessage mime = sender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mime, true, StandardCharsets.UTF_8.name());
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setFrom(new InternetAddress(fromAddress, fromName, StandardCharsets.UTF_8.name()));
            helper.setText(plain, html);
            sender.send(mime);
            log.info("Access approval mail sent to {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send access approval mail to {}: {}", toEmail, e.getMessage());
        }
    }

    private String buildHtml(String displayName, String target, String url) {
        return "<div style=\"font-family:system-ui,-apple-system,sans-serif;max-width:520px;margin:0 auto;padding:32px;color:#1a1a2e;\">"
                + "<h2 style=\"margin:0 0 16px;\">열람 요청이 승인되었습니다</h2>"
                + "<p style=\"margin:0 0 12px;\">" + safe(displayName) + "님, 요청하신 " + target + "의 열람이 승인되었습니다.</p>"
                + "<p style=\"margin:0 0 24px;\">아래 버튼을 눌러 바로 확인해보세요.</p>"
                + "<a href=\"" + url + "\" style=\"display:inline-block;padding:12px 24px;background:#1a1a2e;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;\">글 보러 가기</a>"
                + "<p style=\"margin:32px 0 0;font-size:12px;color:#78849a;\">본 메일은 KSCOLD 블로그의 접근 요청 승인 알림입니다.</p>"
                + "</div>";
    }

    private String safe(String s) {
        if (s == null) return "";
        return s.replace("<", "&lt;").replace(">", "&gt;");
    }
}
