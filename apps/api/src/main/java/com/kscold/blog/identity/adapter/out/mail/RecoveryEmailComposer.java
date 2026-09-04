package com.kscold.blog.identity.adapter.out.mail;

import com.kscold.blog.identity.domain.model.User;
import com.kscold.blog.identity.domain.port.out.PasswordResetSettings;
import com.kscold.blog.identity.domain.port.out.RecoveryMailComposer;
import com.kscold.blog.notification.adapter.out.mail.BrandedMailTemplate;
import com.kscold.blog.notification.config.MailProperties;
import com.kscold.blog.notification.domain.model.MailMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class RecoveryEmailComposer implements RecoveryMailComposer {

    private final MailProperties mailProperties;
    private final BrandedMailTemplate mailTemplate;
    private final PasswordResetSettings passwordResetSettings;

    @Override
    public MailMessage buildUsernameReminder(User user) {
        String subject = "[KSCOLD] 가입 아이디 안내";
        String preview = user.getDisplayName() + "님이 가입에 사용한 아이디를 안내드려요.";
        String summary = "가입에 사용한 아이디를 아래에서 바로 확인할 수 있어요.";
        String body =
                """
                아이디 찾기 요청이 들어와 가입 정보를 확인했습니다.
                아래 아이디로 다시 로그인하시면 됩니다.
                """;
        String details =
                """
                <tr>
                  <td style="padding:0 32px 24px;">
                    <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #E2E8F0; border-radius:20px; background-color:#F8FAFC;">
                      <tr>
                        <td style="padding:20px 22px;">
                          <p style="margin:0 0 8px; font-size:12px; line-height:18px; letter-spacing:0.18em; color:#94A3B8; font-weight:700;">ACCOUNT</p>
                          <p style="margin:0 0 8px; font-size:14px; line-height:22px; color:#475569;">가입 아이디</p>
                          <p style="margin:0; font-size:28px; line-height:36px; font-weight:800; color:#0F172A;">%s</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 32px 32px;">
                    <p style="margin:0; font-size:14px; line-height:24px; color:#64748B;">
                      비밀번호가 기억나지 않는다면 아래 링크에서 재설정도 함께 진행할 수 있습니다.
                    </p>
                  </td>
                </tr>
                """
                        .formatted(mailTemplate.escapeHtml(user.getUsername()));

        String actionUrl = mailProperties.resolvePublicUrl("/login/recovery?tab=password");
        String actionLabel = "비밀번호 재설정하기";
        String plainText =
                """
                %s님, 가입 아이디를 안내드립니다.

                아이디: %s

                비밀번호가 기억나지 않는다면 아래 주소에서 재설정할 수 있습니다.
                %s
                """
                        .formatted(user.getDisplayName(), user.getUsername(), actionUrl);

        return new MailMessage(
                user.getEmail(),
                subject,
                plainText,
                mailTemplate.render(
                        preview,
                        "가입 아이디를 확인해 주세요",
                        summary,
                        body,
                        details,
                        actionUrl,
                        actionLabel));
    }

    @Override
    public MailMessage buildPasswordReset(User user, String resetUrl) {
        String expiryMinutes = Long.toString(passwordResetSettings.getPasswordResetExpiryMinutes());
        String subject = "[KSCOLD] 비밀번호 재설정 안내";
        String preview = "비밀번호를 다시 설정할 수 있도록 안전한 링크를 보내드려요.";
        String summary = "아래 버튼을 눌러 새 비밀번호를 설정해 주세요.";
        String body =
                """
                비밀번호 재설정 요청이 확인되어, 한 번만 사용할 수 있는 안전한 링크를 준비했습니다.
                링크는 너무 길게 열어두지 않고 %s분 동안만 유효하게 동작합니다.
                """
                        .formatted(expiryMinutes);
        String details =
                """
                <tr>
                  <td style="padding:0 32px 24px;">
                    <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #E2E8F0; border-radius:20px; background-color:#F8FAFC;">
                      <tr>
                        <td style="padding:20px 22px;">
                          <p style="margin:0 0 8px; font-size:12px; line-height:18px; letter-spacing:0.18em; color:#94A3B8; font-weight:700;">SECURITY</p>
                          <p style="margin:0 0 8px; font-size:14px; line-height:24px; color:#475569;">요청 계정</p>
                          <p style="margin:0; font-size:22px; line-height:30px; font-weight:800; color:#0F172A;">%s</p>
                          <p style="margin:6px 0 0; font-size:14px; line-height:22px; color:#64748B;">%s</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                """
                        .formatted(
                                mailTemplate.escapeHtml(user.getDisplayName()),
                                mailTemplate.escapeHtml(user.getEmail()));
        String plainText =
                """
                %s님, 비밀번호 재설정 링크를 보내드립니다.

                아래 주소는 %s분 동안만 유효합니다.
                %s

                본인이 요청하지 않았다면 이 메일은 무시하셔도 괜찮습니다.
                """
                        .formatted(user.getDisplayName(), expiryMinutes, resetUrl);

        return new MailMessage(
                user.getEmail(),
                subject,
                plainText,
                mailTemplate.render(
                        preview,
                        "비밀번호를 다시 설정해 주세요",
                        summary,
                        body,
                        details,
                        resetUrl,
                        "비밀번호 다시 설정하기"));
    }

    @Override
    public MailMessage buildWelcome(User user) {
        String loginUrl = mailProperties.resolvePublicUrl("/login");
        String subject = "[KSCOLD] 가입을 환영합니다";
        String preview = user.getDisplayName() + "님의 가입이 완료되었습니다.";
        String summary = "김승찬의 블로그에서 일상과 기술, 작업 기록을 지금부터 편하게 둘러보세요.";
        String body =
                """
                가입이 정상적으로 완료되었습니다.
                이제 블로그 글, 피드, Vault 노트, 방명록, 채팅 기능을 현재 계정으로 바로 이용하실 수 있습니다.
                """;
        String details =
                """
                <tr>
                  <td style="padding:0 32px 24px;">
                    <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #E2E8F0; border-radius:20px; background-color:#F8FAFC;">
                      <tr>
                        <td style="padding:20px 22px;">
                          <p style="margin:0 0 8px; font-size:12px; line-height:18px; letter-spacing:0.18em; color:#94A3B8; font-weight:700;">WELCOME</p>
                          <p style="margin:0 0 8px; font-size:14px; line-height:24px; color:#475569;">가입 계정</p>
                          <p style="margin:0; font-size:22px; line-height:30px; font-weight:800; color:#0F172A;">%s</p>
                          <p style="margin:6px 0 0; font-size:14px; line-height:22px; color:#64748B;">아이디 %s 로 바로 로그인할 수 있습니다.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                """
                        .formatted(
                                mailTemplate.escapeHtml(user.getEmail()),
                                mailTemplate.escapeHtml(user.getUsername()));

        String plainText =
                """
                %s님, 가입을 환영합니다.

                가입한 이메일: %s
                아이디: %s

                로그인:
                %s
                """
                        .formatted(
                                user.getDisplayName(),
                                user.getEmail(),
                                user.getUsername(),
                                loginUrl);

        return new MailMessage(
                user.getEmail(),
                subject,
                plainText,
                mailTemplate.render(
                        preview, "가입을 환영합니다", summary, body, details, loginUrl, "로그인 바로가기"));
    }
}
