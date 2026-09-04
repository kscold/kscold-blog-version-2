package com.kscold.blog.notification.adapter.out.mail;

import static org.assertj.core.api.Assertions.assertThat;

import com.kscold.blog.notification.config.MailProperties;
import org.junit.jupiter.api.Test;

class BrandedMailTemplateTest {

    @Test
    void 사용자_문자열은_이스케이프하고_작성기가_준_상세_마크업은_유지한다() {
        MailProperties properties = new MailProperties();
        properties.setFromName("<KSCOLD>");
        BrandedMailTemplate template = new BrandedMailTemplate(properties);

        String html =
                template.render(
                        "<미리보기>",
                        "<제목>",
                        "요약 & 안내",
                        "첫 줄\n둘째 줄",
                        "<tr><td>신뢰한 상세</td></tr>",
                        "https://kscold.com/path?a=1&b=2",
                        "<확인>");

        assertThat(html)
                .contains("&lt;KSCOLD&gt; BLOG")
                .contains("&lt;제목&gt;")
                .contains("요약 &amp; 안내")
                .contains("첫 줄<br />둘째 줄")
                .contains("<tr><td>신뢰한 상세</td></tr>")
                .contains("https://kscold.com/path?a=1&amp;b=2")
                .doesNotContain("<미리보기>", "<확인>");
    }

    @Test
    void 채팅_미리보기는_이스케이프한_뒤_지정한_길이로_줄인다() {
        BrandedMailTemplate template = new BrandedMailTemplate(new MailProperties());

        String truncated = template.truncateEscaped("<script>alert('x')</script>", 16);

        assertThat(truncated).hasSize(16).endsWith("…").doesNotContain("<script>");
    }
}
