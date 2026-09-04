package com.kscold.blog.chat.adapter.out.mail;

import static org.assertj.core.api.Assertions.assertThat;

import com.kscold.blog.notification.adapter.out.mail.BrandedMailTemplate;
import com.kscold.blog.notification.config.MailProperties;
import com.kscold.blog.notification.domain.model.MailMessage;
import org.junit.jupiter.api.Test;

class ChatReminderEmailComposerTest {

    @Test
    void 관리자_답장_알림은_수신자와_링크를_유지하고_HTML을_이스케이프한다() {
        MailProperties properties = new MailProperties();
        ChatReminderEmailComposer composer =
                new ChatReminderEmailComposer(new BrandedMailTemplate(properties));

        MailMessage message =
                composer.buildUnreadReminder(
                        "reader@example.com",
                        "독자",
                        "<관리자>",
                        "<script>alert('x')</script>",
                        2,
                        "https://kscold.com/?chat=open");

        assertThat(message.to()).isEqualTo("reader@example.com");
        assertThat(message.subject()).isEqualTo("[KSCOLD] 새 답장이 도착했습니다");
        assertThat(message.plainText()).contains("독자님", "새 답장 2건", "https://kscold.com/?chat=open");
        assertThat(message.htmlBody())
                .contains("&lt;관리자&gt;님의 새 답장 2건")
                .contains("&lt;script&gt;")
                .doesNotContain("<script>");
    }
}
