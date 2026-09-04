package com.kscold.blog.analytics.application.service;

import com.kscold.blog.blog.application.port.in.CategoryUseCase;
import com.kscold.blog.blog.application.port.in.PostUseCase;
import com.kscold.blog.blog.application.port.in.TagUseCase;
import com.kscold.blog.identity.application.port.in.UserProfileUseCase;
import com.kscold.blog.social.application.port.in.FeedUseCase;
import com.kscold.blog.vault.application.port.in.VaultNoteUseCase;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/** 실제 존재하는 페이지인지 검증한다. 정적 라우트는 정확히 일치시키고 동적 라우트는 대응 리소스가 있을 때만 허용한다. */
@Slf4j
@Component
@RequiredArgsConstructor
public class PageExistenceChecker {

    private final PostUseCase postUseCase;
    private final CategoryUseCase categoryUseCase;
    private final TagUseCase tagUseCase;
    private final FeedUseCase feedUseCase;
    private final VaultNoteUseCase vaultNoteUseCase;
    private final UserProfileUseCase userProfileUseCase;

    private static final Set<String> STATIC_PATHS =
            Set.of(
                    "/",
                    "/blog",
                    "/feed",
                    "/vault",
                    "/info",
                    "/guestbook",
                    "/admin-night",
                    "/admin-night/ai-agent-bloom",
                    "/login",
                    "/login/recovery",
                    "/login/reset-password",
                    "/privacy",
                    "/product",
                    "/info/instructor",
                    "/info/pawpong",
                    "/info/gole");

    private static final Pattern BLOG_TAG = Pattern.compile("^/blog/tags/([^/]+)$");
    private static final Pattern BLOG_POST = Pattern.compile("^/blog/([^/]+)/([^/]+)$");
    private static final Pattern BLOG_CATEGORY = Pattern.compile("^/blog/([^/]+)$");
    private static final Pattern FEED_DETAIL = Pattern.compile("^/feed/([^/]+)$");
    private static final Pattern VAULT_DETAIL = Pattern.compile("^/vault/([^/]+)$");
    private static final Pattern PROFILE_DETAIL = Pattern.compile("^/profile/([^/]+)$");
    private static final Pattern UNIFIED_TAG = Pattern.compile("^/tags/[^/]+$");

    public boolean exists(String path) {
        if (path == null) return false;
        if (STATIC_PATHS.contains(path)) return true;
        if (UNIFIED_TAG.matcher(path).matches()) return true;

        Matcher tag = BLOG_TAG.matcher(path);
        if (tag.matches()) {
            String slug = decode(tag.group(1));
            return callSafely(() -> tagUseCase.getBySlug(slug) != null);
        }

        Matcher blog = BLOG_POST.matcher(path);
        if (blog.matches()) {
            String slug = decode(blog.group(2));
            return callSafely(() -> postUseCase.existsBySlug(slug));
        }

        Matcher category = BLOG_CATEGORY.matcher(path);
        if (category.matches()) {
            String slug = decode(category.group(1));
            return callSafely(() -> categoryUseCase.getBySlug(slug) != null);
        }

        Matcher feed = FEED_DETAIL.matcher(path);
        if (feed.matches()) {
            String id = feed.group(1);
            return callSafely(() -> feedUseCase.getById(id) != null);
        }

        Matcher vault = VAULT_DETAIL.matcher(path);
        if (vault.matches()) {
            String slug = decode(vault.group(1));
            return callSafely(() -> vaultNoteUseCase.existsBySlug(slug));
        }

        Matcher profile = PROFILE_DETAIL.matcher(path);
        if (profile.matches()) {
            String username = decode(profile.group(1));
            return callSafely(() -> userProfileUseCase.getPublicProfile(username) != null);
        }

        return false;
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
