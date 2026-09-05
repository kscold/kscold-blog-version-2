package com.kscold.blog.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kscold.blog.exception.ErrorCode;
import com.kscold.blog.identity.adapter.in.web.CookieCsrfProtectionFilter;
import com.kscold.blog.identity.adapter.in.web.JwtAuthenticationFilter;
import com.kscold.blog.shared.web.ApiResponse;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private static final String[] PUBLIC_READ_PATHS = {
        "/posts/**",
        "/categories/**",
        "/tags/**",
        "/search/**",
        "/github/**",
        "/users/profile/*",
        "/users/*/feeds",
        "/feeds/**",
        "/guestbook/**",
        "/admin-night/calendar",
        "/admin-night/programs/*/summary",
        "/vault/**",
        "/access-requests/check/**"
    };

    private static final String[] ADMIN_POST_READ_PATHS = {"/posts/admin", "/posts/exists/**"};

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final CookieCsrfProtectionFilter cookieCsrfProtectionFilter;
    private final ObjectMapper objectMapper;
    private final CorsOriginPolicy corsOriginPolicy;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(
                        session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(
                        exceptions ->
                                exceptions
                                        .authenticationEntryPoint(
                                                (request, response, authException) ->
                                                        writeErrorResponse(
                                                                response,
                                                                ErrorCode.UNAUTHORIZED,
                                                                "인증이 필요합니다. 다시 로그인해주세요."))
                                        .accessDeniedHandler(
                                                (request, response, accessDeniedException) ->
                                                        writeErrorResponse(
                                                                response,
                                                                ErrorCode.FORBIDDEN,
                                                                "접근 권한이 없습니다.")))
                .authorizeHttpRequests(
                        auth ->
                                auth
                                        // 공개 포스트 와일드카드보다 먼저 관리자 조회 경로를 잠근다.
                                        .requestMatchers(HttpMethod.GET, ADMIN_POST_READ_PATHS)
                                        .hasRole("ADMIN")
                                        .requestMatchers(HttpMethod.HEAD, ADMIN_POST_READ_PATHS)
                                        .hasRole("ADMIN")
                                        // 공개 엔드포인트
                                        .requestMatchers(HttpMethod.GET, PUBLIC_READ_PATHS)
                                        .permitAll()
                                        // GET으로 공개한 리소스는 본문 없는 HEAD 검사에도 같은 권한을 적용한다.
                                        .requestMatchers(HttpMethod.HEAD, PUBLIC_READ_PATHS)
                                        .permitAll()
                                        // 피드 쓰기 공개 엔드포인트
                                        .requestMatchers(HttpMethod.POST, "/feeds/*/like")
                                        .permitAll()
                                        // 댓글 좋아요는 피드 좋아요와 같이 비로그인도 허용
                                        .requestMatchers(
                                                HttpMethod.POST, "/feeds/*/comments/*/like")
                                        .permitAll()
                                        .requestMatchers(
                                                HttpMethod.POST, "/admin-night/programs/*/votes")
                                        .permitAll()
                                        .requestMatchers("/payments/ai-agent-bloom/**")
                                        .permitAll()
                                        // Vault 쓰기 공개 엔드포인트
                                        .requestMatchers(HttpMethod.POST, "/vault/agent/chat")
                                        .permitAll()
                                        .requestMatchers(
                                                HttpMethod.POST, "/vault/agent/chat/stream")
                                        .permitAll()
                                        .requestMatchers(
                                                "/auth/login",
                                                "/auth/register",
                                                "/auth/refresh",
                                                "/auth/logout",
                                                "/auth/recover-username",
                                                "/auth/request-password-reset",
                                                "/auth/reset-password",
                                                "/auth/password-reset/validate")
                                        .permitAll()
                                        .requestMatchers("/health")
                                        .permitAll()
                                        // 팀 내부 문서 (자체 비밀번호 검증)
                                        .requestMatchers(HttpMethod.POST, "/team/private")
                                        .permitAll()
                                        // 정적 리소스
                                        .requestMatchers("/uploads/**")
                                        .permitAll()
                                        // 웹소켓
                                        .requestMatchers("/ws/**", "/socket.io/**")
                                        .permitAll()
                                        // 페이지 방문 트래킹 (비로그인 허용)
                                        .requestMatchers(HttpMethod.POST, "/analytics/page-visit")
                                        .permitAll()
                                        // 관리자 엔드포인트
                                        .requestMatchers("/admin/**")
                                        .hasRole("ADMIN")
                                        // 그 외 모든 요청은 인증 필요
                                        .anyRequest()
                                        .authenticated())
                .addFilterBefore(
                        jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterBefore(cookieCsrfProtectionFilter, JwtAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(corsOriginPolicy.allowedOrigins());
        configuration.setAllowedMethods(
                List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    private void writeErrorResponse(
            jakarta.servlet.http.HttpServletResponse response, ErrorCode errorCode, String message)
            throws java.io.IOException {
        response.setStatus(errorCode.getStatus().value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        objectMapper.writeValue(
                response.getWriter(), ApiResponse.error(errorCode.getCode(), message));
    }
}
