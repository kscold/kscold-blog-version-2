package com.kscold.blog.shared.analytics;

import com.kscold.blog.blog.application.port.in.PostUseCase;
import com.kscold.blog.social.application.port.in.FeedUseCase;
import com.kscold.blog.vault.application.port.in.VaultNoteUseCase;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * 실제 존재하는 페이지인지 검증.
 * - 정적 라우트: 고정 세트
 * - 동적 라우트(/blog/{slug}, /feed/{id}, /vault/{slug}): 실존 리소스만 허용
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class PageExistenceChecker {

    private final PostUseCase postUseCase;
    private final FeedUseCase feedUseCase;
    private final VaultNoteUseCase vaultNoteUseCase;

    private static final Set<String> STATIC_PATHS = Set.of(
            "/", "/blog", "/feed", "/vault", "/info", "/guestbook",
            "/admin-night", "/login", "/privacy"
    );

    private static final Pattern LOGIN_SUB = Pattern.compile("^/login/.*$");
    private static final Pattern INFO_SUB = Pattern.compile("^/info/.*$");
    private static final Pattern ADMIN_NIGHT_SUB = Pattern.compile("^/admin-night/.*$");

    private static final Pattern BLOG_POST = Pattern.compile("^/blog/(?:([^/]+)/)?([^/]+)$");
    private static final Pattern FEED_DETAIL = Pattern.compile("^/feed/([^/]+)$");
    private static final Pattern VAULT_DETAIL = Pattern.compile("^/vault/([^/]+)$");

    public boolean exists(String path) {
        if (path == null) return false;
        if (STATIC_PATHS.contains(path)) return true;
        if (LOGIN_SUB.matcher(path).matches()) return true;
        if (INFO_SUB.matcher(path).matches()) return true;
        if (ADMIN_NIGHT_SUB.matcher(path).matches()) return true;

        Matcher blog = BLOG_POST.matcher(path);
        if (blog.matches()) {
            String slug = decode(blog.group(2));
            return slugSafely(() -> postUseCase.existsBySlug(slug));
        }

        Matcher feed = FEED_DETAIL.matcher(path);
        if (feed.matches()) {
            String id = feed.group(1);
            return callSafely(() -> {
                feedUseCase.getById(id);
                return true;
            });
        }

        Matcher vault = VAULT_DETAIL.matcher(path);
        if (vault.matches()) {
            String slug = decode(vault.group(1));
            return callSafely(() -> {
                vaultNoteUseCase.getBySlugWithView(slug);
                return true;
            });
        }

        return false;
    }

    private boolean slugSafely(java.util.function.Supplier<Boolean> supplier) {
        try {
            return Boolean.TRUE.equals(supplier.get());
        } catch (Exception e) {
            return false;
        }
    }

    private boolean callSafely(java.util.function.Supplier<Boolean> supplier) {
        try {
            return Boolean.TRUE.equals(supplier.get());
        } catch (Exception e) {
            return false;
        }
    }

    private String decode(String raw) {
        try {
            return URLDecoder.decode(raw, StandardCharsets.UTF_8);
        } catch (Exception e) {
            return raw;
        }
    }
}
