package com.kscold.blog.config;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.reset;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.kscold.blog.exception.GlobalExceptionHandler;
import com.kscold.blog.exception.RateLimitExceededException;
import com.kscold.blog.identity.adapter.in.web.CookieCsrfProtectionFilter;
import com.kscold.blog.identity.adapter.in.web.JwtAuthenticationFilter;
import com.kscold.blog.identity.application.port.in.UserQueryPort;
import com.kscold.blog.identity.domain.model.TokenIdentity;
import com.kscold.blog.identity.domain.port.out.TokenProvider;
import com.kscold.blog.notification.application.port.in.NotificationUseCase;
import com.kscold.blog.notification.domain.model.NotificationMessage;
import com.kscold.blog.shared.web.FallbackErrorController;
import com.kscold.blog.shared.web.HealthController;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringBootConfiguration;
import org.springframework.boot.autoconfigure.ImportAutoConfiguration;
import org.springframework.boot.http.converter.autoconfigure.HttpMessageConvertersAutoConfiguration;
import org.springframework.boot.jackson.autoconfigure.JacksonAutoConfiguration;
import org.springframework.boot.security.autoconfigure.SecurityAutoConfiguration;
import org.springframework.boot.security.autoconfigure.web.servlet.SecurityFilterAutoConfiguration;
import org.springframework.boot.security.autoconfigure.web.servlet.ServletWebSecurityAutoConfiguration;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.boot.tomcat.autoconfigure.servlet.TomcatServletWebServerAutoConfiguration;
import org.springframework.boot.webmvc.autoconfigure.DispatcherServletAutoConfiguration;
import org.springframework.boot.webmvc.autoconfigure.WebMvcAutoConfiguration;
import org.springframework.boot.webmvc.autoconfigure.error.ErrorMvcAutoConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;
import tools.jackson.databind.ObjectMapper;

/**
 * 실제 톰캣을 띄워, 컨트롤러 밖에서 끝나는 요청이 클라이언트에 어떻게 보이는지 확인한다.
 *
 * <p>서블릿 컨테이너는 거절한 요청과 필터 예외를 오류 경로로 다시 넘기고, 스트리밍 응답은 본문을 보낸 뒤 같은 요청을 한 번 더 필터에 통과시킨다. 이 재진입은 가짜
 * 서블릿 환경(MockMvc)에서는 일어나지 않아, 잘못된 요청과 서버 오류가 모두 401 로 나가던 문제가 단위 테스트에서는 드러나지 않았다.
 */
@SpringBootTest(
        classes = ServletDispatchSecurityTest.TestApplication.class,
        webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
        properties = {"spring.profiles.active=test", "server.servlet.context-path=/api"})
class ServletDispatchSecurityTest {

    private static final String STREAMED = "streamed-".repeat(4096);

    private final HttpClient client =
            HttpClient.newBuilder().version(HttpClient.Version.HTTP_1_1).build();

    @LocalServerPort private int port;
    @Autowired private TokenProvider tokens;
    @Autowired private UserQueryPort users;
    @Autowired private NotificationUseCase notifications;

    @BeforeEach
    void signInAdministrator() {
        reset(tokens, users, notifications);
        when(tokens.parseAccessToken("admin-token"))
                .thenReturn(Optional.of(new TokenIdentity("admin-1", 0L)));
        when(users.findAuthenticationById("admin-1"))
                .thenReturn(
                        Optional.of(
                                new UserQueryPort.AuthenticationInfo("admin-1", "관리자", true, 0L)));
    }

    @Test
    void requestsRejectedByTheFirewallGetAStandardBadRequest() throws Exception {
        assertError(send("PROPFIND", "/health", null), 400, "E001", "잘못된 요청입니다.");
        assertError(send("GET", "/health;x=1", null), 400, "E001", "잘못된 요청입니다.");
    }

    @Test
    void requestsRejectedByTheContainerKeepTheirStatus() throws Exception {
        assertError(send("TRACE", "/health", null), 405, "E004", "지원하지 않는 요청 방식입니다.");
    }

    @Test
    void unsupportedResponseFormatIsNotReportedAsAServerError() throws Exception {
        HttpResponse<String> response =
                client.send(
                        request("GET", "/health").header("Accept", "text/html").build(),
                        HttpResponse.BodyHandlers.ofString());

        assertError(response, 406, "E001", "요청한 응답 형식을 지원하지 않습니다.");
        verify(notifications, never()).notify(any());
    }

    @Test
    void errorRaisedBeforeAStreamStartsReachesTheStreamingClientUnchanged() throws Exception {
        HttpResponse<String> response =
                client.send(
                        HttpRequest.newBuilder(uri("/vault/agent/page/chat/stream"))
                                .header("Accept", "text/event-stream")
                                .POST(HttpRequest.BodyPublishers.noBody())
                                .build(),
                        HttpResponse.BodyHandlers.ofString());

        assertError(response, 429, "E501", "질문이 몰렸습니다. 잠시 후 다시 시도해주세요.");
    }

    @Test
    void failureInsideAFilterIsAServerErrorNotAnExpiredLogin() throws Exception {
        when(tokens.parseAccessToken("broken-token"))
                .thenThrow(new IllegalStateException("never-return-this"));

        HttpResponse<String> response = send("GET", "/health", "broken-token");

        assertError(response, 500, "E901", "서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
        assertThat(response.body()).doesNotContain("never-return-this");
        ArgumentCaptor<NotificationMessage> alert =
                ArgumentCaptor.forClass(NotificationMessage.class);
        verify(notifications).notify(alert.capture());
        assertThat(alert.getValue().fields())
                .containsExactly(new NotificationMessage.Field("요청", "GET /api/health"));
    }

    @Test
    void protectedPathsStillRequireSignIn() throws Exception {
        assertError(
                send("GET", "/admin/probe/stream", null), 401, "E101", "인증이 필요합니다. 다시 로그인해주세요.");
        assertError(send("GET", "/error", null), 401, "E101", "인증이 필요합니다. 다시 로그인해주세요.");
    }

    @Test
    void callingTheErrorPathDirectlyFindsNothing() throws Exception {
        assertError(send("GET", "/error", "admin-token"), 404, "E301", "요청한 리소스를 찾을 수 없습니다.");
    }

    @Test
    void streamedResponseForASignedInUserCompletes() throws Exception {
        HttpResponse<String> response = send("GET", "/admin/probe/stream", "admin-token");

        assertThat(response.statusCode()).isEqualTo(200);
        assertThat(response.body()).isEqualTo(STREAMED);
    }

    private HttpResponse<String> send(String method, String path, String token) throws Exception {
        HttpRequest.Builder request = request(method, path);
        if (token != null) {
            request.header("Authorization", "Bearer " + token);
        }
        return client.send(request.build(), HttpResponse.BodyHandlers.ofString());
    }

    private HttpRequest.Builder request(String method, String path) {
        return HttpRequest.newBuilder(uri(path))
                .method(method, HttpRequest.BodyPublishers.noBody());
    }

    private URI uri(String path) {
        return URI.create("http://127.0.0.1:" + port + "/api" + path);
    }

    private static void assertError(
            HttpResponse<String> response, int status, String errorCode, String message) {
        assertThat(response.statusCode()).isEqualTo(status);
        assertThat(response.headers().firstValue("Content-Type").orElse(""))
                .startsWith(MediaType.APPLICATION_JSON_VALUE);
        assertThat(response.body())
                .contains("\"success\":false")
                .contains("\"errorCode\":\"" + errorCode + "\"")
                .contains("\"message\":\"" + message + "\"");
    }

    @SpringBootConfiguration
    @ImportAutoConfiguration({
        TomcatServletWebServerAutoConfiguration.class,
        DispatcherServletAutoConfiguration.class,
        WebMvcAutoConfiguration.class,
        ErrorMvcAutoConfiguration.class,
        HttpMessageConvertersAutoConfiguration.class,
        JacksonAutoConfiguration.class,
        SecurityAutoConfiguration.class,
        ServletWebSecurityAutoConfiguration.class,
        SecurityFilterAutoConfiguration.class
    })
    @Import({
        SecurityConfig.class,
        JacksonConfig.class,
        GlobalExceptionHandler.class,
        HealthController.class,
        FallbackErrorController.class,
        StreamProbe.class
    })
    static class TestApplication {
        @Bean
        NotificationUseCase notifications() {
            return mock(NotificationUseCase.class);
        }

        @Bean
        TokenProvider tokens() {
            return mock(TokenProvider.class);
        }

        @Bean
        UserQueryPort users() {
            return mock(UserQueryPort.class);
        }

        @Bean
        CorsOriginPolicy corsOriginPolicy() {
            return new CorsOriginPolicy("https://kscold.com");
        }

        @Bean
        JwtAuthenticationFilter jwtAuthenticationFilter(TokenProvider tokens, UserQueryPort users) {
            return new JwtAuthenticationFilter(tokens, users);
        }

        @Bean
        CookieCsrfProtectionFilter cookieCsrfProtectionFilter(
                CorsOriginPolicy policy, ObjectMapper mapper) {
            return new CookieCsrfProtectionFilter(policy, mapper);
        }
    }

    /** 운영의 스트리밍 엔드포인트와 같은 조건을 만드는 시험용 엔드포인트. */
    @RestController
    static class StreamProbe {
        /** 페이지 에이전트처럼, 이벤트 스트림만 받겠다는 요청이 스트림을 열기 전에 요청 제한에 걸린다. */
        @PostMapping(
                value = "/vault/agent/page/chat/stream",
                produces = MediaType.TEXT_EVENT_STREAM_VALUE)
        SseEmitter busy() {
            throw new RateLimitExceededException("질문이 몰렸습니다. 잠시 후 다시 시도해주세요.");
        }

        /** 관리자 파일 내려받기처럼, 로그인이 필요한 경로에서 길이를 미리 알리지 않고 본문을 흘려보낸다. */
        @GetMapping("/admin/probe/stream")
        ResponseEntity<StreamingResponseBody> stream() {
            StreamingResponseBody body = output -> output.write(STREAMED.getBytes());
            return ResponseEntity.ok().contentType(MediaType.TEXT_PLAIN).body(body);
        }
    }
}
