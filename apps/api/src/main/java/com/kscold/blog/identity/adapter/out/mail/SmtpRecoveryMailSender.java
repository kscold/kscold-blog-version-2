package com.kscold.blog.identity.adapter.out.mail;

import com.kscold.blog.exception.BusinessException;
import com.kscold.blog.exception.ErrorCode;
import com.kscold.blog.identity.application.port.out.RecoveryMailMessage;
import com.kscold.blog.identity.application.port.out.RecoveryMailSender;
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
public class SmtpRecoveryMailSender implements RecoveryMailSender {

    private final ObjectProvider<JavaMailSender> mailSenderProvider;
    private final RecoveryMailProperties recoveryMailProperties;

    @Value("${spring.mail.host:}")
    private String mailHost;

    @Override
    public boolean isAvailable() {
        return StringUtils.hasText(mailHost)
                && StringUtils.hasText(recoveryMailProperties.getFromAddress())
                && mailSenderProvider.getIfAvailable() != null;
    }

    @Override
    public void send(RecoveryMailMessage message) {
        if (!isAvailable()) {
            throw new BusinessException(
                    ErrorCode.INTERNAL_SERVER_ERROR,
                    "이메일 발송 설정이 아직 준비되지 않았습니다. SMTP 설정을 확인해주세요."
            );
        }

        JavaMailSender mailSender = mailSenderProvider.getObject();

        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(
                    mimeMessage,
                    true,
                    StandardCharsets.UTF_8.name()
            );

            helper.setTo(message.to());
            helper.setSubject(message.subject());
            helper.setFrom(
                    new InternetAddress(
                            recoveryMailProperties.getFromAddress(),
                            recoveryMailProperties.getFromName(),
                            StandardCharsets.UTF_8.name()
                    )
            );
            helper.setText(message.plainText(), message.htmlBody());
            mailSender.send(mimeMessage);
        } catch (Exception exception) {
            log.error("Failed to send recovery email to {}", message.to(), exception);
            throw new BusinessException(
                    ErrorCode.INTERNAL_SERVER_ERROR,
                    "이메일 발송에 실패했습니다. 잠시 후 다시 시도해주세요."
            );
        }
    }
}
