package com.kscold.blog.identity.adapter.out.mail;

import com.kscold.blog.exception.BusinessException;
import com.kscold.blog.exception.ErrorCode;
import com.kscold.blog.identity.domain.port.out.RecoveryMailMessage;
import com.kscold.blog.identity.domain.port.out.RecoveryMailSender;
import com.kscold.blog.notification.application.port.in.MessageDeliveryUseCase;
import com.kscold.blog.notification.domain.model.MessageDeliveryLog;
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
public class SmtpRecoveryMailSender implements RecoveryMailSender {

    private final ObjectProvider<JavaMailSender> mailSenderProvider;
    private final RecoveryMailProperties recoveryMailProperties;
    private final MessageDeliveryUseCase messageDeliveryUseCase;

    @Value("${spring.mail.host:}")
    private String mailHost;

    /** 계정 안내·댓글 알림·방명록 답글이 모두 이 발송기를 지난다. 로그에서 구분하려고 제목을 함께 남긴다. */
    private static final String PURPOSE = "MAIL";

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
                            recoveryMailProperties.getFromAddress(),
                            recoveryMailProperties.getFromName(),
                            StandardCharsets.UTF_8.name()));
            helper.setText(message.plainText(), message.htmlBody());
            mailSender.send(mimeMessage);
            // 이메일은 SMTP 라 나중에 도달 여부를 물어볼 곳이 없다. 보낸 사실만이라도 남긴다.
            messageDeliveryUseCase.record(
                    MessageDeliveryLog.sent(
                            MessageDeliveryLog.Channel.EMAIL,
                            PURPOSE,
                            message.to(),
                            null,
                            message.subject()));
        } catch (Exception exception) {
            log.error("Failed to send recovery email to {}", message.to(), exception);
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
