package com.kscold.blog.config;

import static org.assertj.core.api.Assertions.assertThat;

import com.kscold.blog.analytics.adapter.in.web.dto.request.PageVisitRequest;
import com.kscold.blog.identity.application.dto.command.LoginCommand;
import com.kscold.blog.stackshare.adapter.in.web.dto.request.ChangeStackShareSettledRequest;
import java.time.LocalDateTime;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringBootConfiguration;
import org.springframework.boot.test.autoconfigure.json.JsonTest;
import org.springframework.context.annotation.Import;
import tools.jackson.databind.json.JsonMapper;

/**
 * 운영에서 쓰는 JSON 매퍼(자동 구성 + application.yml + {@link JacksonConfig})가 API 계약을 지키는지 확인한다.
 *
 * <p>프레임워크나 Jackson 을 올릴 때 요청 바인딩과 응답 표기가 조용히 바뀌는 것을 막는다. Spring Boot 4 로 올릴 때 본문이 있는 모든 요청이 500 으로
 * 끝나는 문제가 단위 테스트에서는 드러나지 않았다.
 */
@JsonTest
@Import(JacksonConfig.class)
class JacksonContractTest {

    @Autowired private JsonMapper mapper;

    @Test
    void bindsRequestBodiesThroughAllArgsConstructors() {
        LoginCommand login =
                mapper.readValue(
                        "{\"email\":\"a@b.co\",\"password\":\"12345678\"}", LoginCommand.class);

        assertThat(login.getEmail()).isEqualTo("a@b.co");
        assertThat(login.getPassword()).isEqualTo("12345678");
    }

    @Test
    void bindsSingleFieldBodiesAsObjects() {
        PageVisitRequest visit = mapper.readValue("{\"path\":\"/vault\"}", PageVisitRequest.class);

        assertThat(visit.getPath()).isEqualTo("/vault");
    }

    @Test
    void toleratesMissingUnknownAndNullPrimitiveFields() {
        ChangeStackShareSettledRequest request =
                mapper.readValue(
                        "{\"id\":\"s1\",\"settled\":null,\"extra\":1}",
                        ChangeStackShareSettledRequest.class);

        assertThat(request.getId()).isEqualTo("s1");
        assertThat(request.isSettled()).isFalse();
        assertThat(mapper.readValue("{}", LoginCommand.class).getEmail()).isNull();
    }

    @Test
    void writesResponsesInDeclarationOrderWithIsoDatesAndEnumNames() {
        Sample sample = new Sample("b", "a", LocalDateTime.of(2026, 10, 6, 9, 30), Tone.WARM, null);

        assertThat(mapper.writeValueAsString(sample))
                .isEqualTo(
                        "{\"zebra\":\"b\",\"apple\":\"a\",\"at\":\"2026-10-06T09:30:00\","
                                + "\"tone\":\"WARM\",\"missing\":null}");
    }

    record Sample(String zebra, String apple, LocalDateTime at, Tone tone, String missing) {}

    enum Tone {
        WARM;

        @Override
        public String toString() {
            return "따뜻함";
        }
    }

    /** 실제 애플리케이션 구성을 띄우지 않고 JSON 자동 구성만 불러오게 한다. */
    @SpringBootConfiguration
    static class TestApplication {}
}
