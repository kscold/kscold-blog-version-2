package com.kscold.blog.notification.adapter.out.mail;

import com.kscold.blog.exception.BusinessException;
import com.kscold.blog.exception.ErrorCode;
import com.kscold.blog.notification.application.port.in.MessageDeliveryUseCase;
import com.kscold.blog.notification.config.MailProperties;
import com.kscold.blog.notification.domain.model.MailMessage;
import com.kscold.blog.notification.domain.model.MessageDeliveryLog;
import com.kscold.blog.notification.domain.port.out.MailSender;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import java.nio.charset.StandardCharsets;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Slf4j
@Component
@RequiredArgsConstructor
public class SmtpMailSender implements MailSender {

    private static final String PURPOSE = "MAIL";

    private final ObjectProvider<JavaMailSender> mailSenderProvider;
    private final MailProperties mailProperties;
    private final MessageDeliveryUseCase messageDeliveryUseCase;

    @Value("${spring.mail.host:}")
    private String mailHost;

    @Override
    public boolean isAvailable() {
        return StringUtils.hasText(mailHost)
                && StringUtils.hasText(mailProperties.getFromAddress())
                && mailSenderProvider.getIfAvailable() != null;
    }

    @Override
    public void send(MailMessage message) {
        if (!isAvailable()) {
            throw new BusinessException(
                    ErrorCode.INTERNAL_SERVER_ERROR, "이메일 발송 설정이 아직 준비되지 않았습니다. SMTP 설정을 확인해주세요.");
        }

        JavaMailSender mailSender = mailSenderProvider.getObject();

        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper =
                    new MimeMessageHelper(mimeMessage, true, StandardCharsets.UTF_8.name());

            helper.setTo(message.to());
            helper.setSubject(message.subject());
            helper.setFrom(
                    new InternetAddress(
                            mailProperties.getFromAddress(),
                            mailProperties.getFromName(),
                            StandardCharsets.UTF_8.name()));
            helper.setText(message.plainText(), message.htmlBody());
            mailSender.send(mimeMessage);
            messageDeliveryUseCase.record(
                    MessageDeliveryLog.sent(
                            MessageDeliveryLog.Channel.EMAIL,
                            PURPOSE,
                            message.to(),
                            null,
                            message.subject()));
        } catch (Exception exception) {
            log.error("Failed to send email to {}", message.to(), exception);
            messageDeliveryUseCase.record(
                    MessageDeliveryLog.failed(
                            MessageDeliveryLog.Channel.EMAIL,
                            PURPOSE,
                            message.to(),
                            null,
                            message.subject(),
                            exception.getMessage()));
            throw new BusinessException(
                    ErrorCode.INTERNAL_SERVER_ERROR, "이메일 발송에 실패했습니다. 잠시 후 다시 시도해주세요.");
        }
    }
}
