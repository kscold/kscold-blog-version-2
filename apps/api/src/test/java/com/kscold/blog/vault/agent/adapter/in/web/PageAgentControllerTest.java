package com.kscold.blog.vault.agent.adapter.in.web;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.asyncDispatch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.request;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kscold.blog.config.CorsOriginPolicy;
import com.kscold.blog.config.SecurityConfig;
import com.kscold.blog.exception.GlobalExceptionHandler;
import com.kscold.blog.exception.RateLimitExceededException;
import com.kscold.blog.identity.adapter.in.web.CookieCsrfProtectionFilter;
import com.kscold.blog.identity.adapter.in.web.JwtAuthenticationFilter;
import com.kscold.blog.identity.application.port.in.UserQueryPort;
import com.kscold.blog.identity.domain.model.TokenIdentity;
import com.kscold.blog.identity.domain.port.out.TokenProvider;
import com.kscold.blog.notification.application.port.in.NotificationUseCase;
import com.kscold.blog.vault.agent.application.port.in.PageAgentUseCase;
import com.kscold.blog.vault.agent.config.VaultAgentProperties;
import com.kscold.blog.vault.agent.domain.model.AgentChatResult;
import com.kscold.blog.vault.agent.domain.model.AgentStreamEvent;
import com.kscold.blog.vault.agent.domain.model.PageAgentStreamSession;
import jakarta.servlet.http.Cookie;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.Executor;
import java.util.function.Consumer;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.mock.web.MockServletContext;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.support.AnnotationConfigWebApplicationContext;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;

class PageAgentControllerTest {
    private static final String ENDPOINT = "/vault/agent/page/chat/stream";
    private static final String BODY =
            "{\"message\":\"역할을 설명해줘\",\"pageContext\":{\"title\":\"작업 소개\",\"path\":\"/work-sample\",\"sections\":[{\"id\":\"one\",\"title\":\"자료\",\"content\":\"팀 협업 설명\"}]}}";
    private AnnotationConfigWebApplicationContext context;
    private MockMvc mvc;
    private PageAgentUseCase useCase;

    @BeforeEach
    void setUp() {
        context = new AnnotationConfigWebApplicationContext();
        context.setServletContext(new MockServletContext());
        context.register(TestConfiguration.class);
        context.refresh();
        useCase = context.getBean(PageAgentUseCase.class);
        mvc =
                MockMvcBuilders.webAppContextSetup(context)
                        .apply(springSecurity())
                        .addFilters(
                                new PageAgentPayloadLimitFilter(
                                        new ObjectMapper().findAndRegisterModules()))
                        .build();
        when(useCase.reserve(any())).thenAnswer(ignored -> new PageAgentStreamSession(() -> {}));
        doAnswer(
                invocation -> {
                    Consumer<AgentStreamEvent> receiver = invocation.getArgument(2);
                    receiver.accept(AgentStreamEvent.delta("페이지 설명"));
                    receiver.accept(
                            AgentStreamEvent.completed(
                                    new AgentChatResult(
                                            "페이지 설명", List.of(), List.of(), List.of())));
                    return null;
                })
                .when(useCase)
                .stream(any(), any(), any());
    }

    @AfterEach
    void tearDown() {
        context.close();
    }

    @Test
    void anonymousCanUseStatelessStreamWithNoStoreHeaders() throws Exception {
        MvcResult result =
                mvc.perform(post(ENDPOINT).contentType("application/json").content(BODY))
                        .andExpect(request().asyncStarted())
                        .andReturn();
        mvc.perform(asyncDispatch(result))
                .andExpect(status().isOk())
                .andExpect(header().string("Cache-Control", "no-store, no-transform"))
                .andExpect(header().string("X-Robots-Tag", "noindex, nofollow, noarchive"));
        assertThat(result.getResponse().getContentAsString())
                .contains("event:delta", "event:complete", "\"sessionId\":\"\"");
        verifyNoInteractions(context.getBean(UserQueryPort.class));
    }

    @Test
    void administratorUsesExactSameContractWithoutPrivatePermissionLookup() throws Exception {
        var principal =
                new UsernamePasswordAuthenticationToken(
                        "admin-test", null, List.of(new SimpleGrantedAuthority("ROLE_ADMIN")));
        MvcResult result =
                mvc.perform(
                                post(ENDPOINT)
                                        .contentType("application/json")
                                        .content(BODY)
                                        .with(authentication(principal)))
                        .andExpect(request().asyncStarted())
                        .andReturn();
        mvc.perform(asyncDispatch(result)).andExpect(status().isOk());
        verifyNoInteractions(context.getBean(UserQueryPort.class));
    }

    @Test
    void rejectsIdentityAndPermissionInjectionBeforeRunningAgent() throws Exception {
        mvc.perform(
                        post(ENDPOINT)
                                .contentType("application/json")
                                .content(
                                        BODY.replace(
                                                "\"message\":",
                                                "\"userId\":\"administrator\",\"message\":")))
                .andExpect(status().isBadRequest());
        mvc.perform(
                        post(ENDPOINT)
                                .contentType("application/json")
                                .content(
                                        BODY.replace(
                                                "\"title\":\"작업 소개\"",
                                                "\"fullContentAccess\":true,\"title\":\"작업 소개\"")))
                .andExpect(status().isBadRequest());
        verifyNoInteractions(useCase);
    }

    @Test
    void limitsPayloadAndRequestsBeforeProviderRuns() throws Exception {
        mvc.perform(post(ENDPOINT).contentType("application/json").content("가".repeat(96 * 1024)))
                .andExpect(status().isPayloadTooLarge());
        verifyNoInteractions(useCase);
        when(useCase.reserve(any())).thenThrow(new RateLimitExceededException("요청 제한"));
        mvc.perform(post(ENDPOINT).contentType("application/json").content(BODY))
                .andExpect(status().isTooManyRequests());
    }

    @Test
    void actualAdministratorCookieCannotChangePageAgentContentScope() throws Exception {
        TokenProvider tokens = context.getBean(TokenProvider.class);
        UserQueryPort users = context.getBean(UserQueryPort.class);
        when(tokens.parseAccessToken("mock-admin-token"))
                .thenReturn(Optional.of(new TokenIdentity("admin-test", 0)));
        when(users.findAuthenticationById("admin-test"))
                .thenReturn(
                        Optional.of(
                                new UserQueryPort.AuthenticationInfo(
                                        "admin-test", "관리자", true, 0)));
        MvcResult result =
                mvc.perform(
                                post(ENDPOINT)
                                        .contentType("application/json")
                                        .content(BODY)
                                        .cookie(new Cookie("auth-token", "mock-admin-token"))
                                        .header("Origin", "https://kscold.com"))
                        .andExpect(request().asyncStarted())
                        .andReturn();
        mvc.perform(asyncDispatch(result)).andExpect(status().isOk());
        assertThat(result.getResponse().getContentAsString())
                .doesNotContain("admin-test", "fullContentAccess", "vault");
        verify(users).findAuthenticationById("admin-test");
        verify(users, never()).getUserById(any());
    }

    @Test
    void providerFailureCannotExposeSensitiveErrorOrCreateSuccessfulAnswer() throws Exception {
        doThrow(new IllegalStateException("mock-private-provider-error")).when(useCase).stream(
                any(), any(), any());
        MvcResult result =
                mvc.perform(post(ENDPOINT).contentType("application/json").content(BODY))
                        .andExpect(request().asyncStarted())
                        .andReturn();
        mvc.perform(asyncDispatch(result)).andExpect(status().isOk());
        assertThat(result.getResponse().getContentAsString())
                .contains("event:error")
                .doesNotContain("mock-private-provider-error", "event:complete");
        verifyNoInteractions(context.getBean(NotificationUseCase.class));
    }

    @Configuration
    @EnableWebMvc
    @Import({SecurityConfig.class, PageAgentController.class, GlobalExceptionHandler.class})
    static class TestConfiguration {
        @Bean
        PageAgentUseCase useCase() {
            return mock(PageAgentUseCase.class);
        }

        @Bean
        NotificationUseCase notification() {
            return mock(NotificationUseCase.class);
        }

        @Bean
        ObjectMapper mapper() {
            return new ObjectMapper().findAndRegisterModules();
        }

        @Bean
        PageAgentClientIdentifierResolver identifiers() {
            return new PageAgentClientIdentifierResolver(new VaultAgentProperties());
        }

        @Bean(name = "vaultAgentSseExecutor")
        Executor executor() {
            return Runnable::run;
        }

        @Bean
        CorsOriginPolicy policy() {
            return new CorsOriginPolicy("https://kscold.com");
        }

        @Bean
        UserQueryPort userQuery() {
            return mock(UserQueryPort.class);
        }

        @Bean
        TokenProvider tokens() {
            return mock(TokenProvider.class);
        }

        @Bean
        JwtAuthenticationFilter jwtFilter(UserQueryPort users, TokenProvider tokens) {
            return new JwtAuthenticationFilter(tokens, users);
        }

        @Bean
        CookieCsrfProtectionFilter csrfFilter(CorsOriginPolicy policy, ObjectMapper mapper) {
            return new CookieCsrfProtectionFilter(policy, mapper);
        }
    }
}
