package com.kscold.blog.analytics.application.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.kscold.blog.blog.application.port.in.CategoryUseCase;
import com.kscold.blog.blog.application.port.in.PostUseCase;
import com.kscold.blog.blog.application.port.in.TagCatalogUseCase;
import com.kscold.blog.blog.application.port.in.TagUseCase;
import com.kscold.blog.blog.domain.model.Category;
import com.kscold.blog.blog.domain.model.Tag;
import com.kscold.blog.blog.domain.model.TagUsage;
import com.kscold.blog.identity.application.dto.response.PublicProfileResponse;
import com.kscold.blog.identity.application.port.in.UserProfileUseCase;
import com.kscold.blog.social.application.port.in.FeedUseCase;
import com.kscold.blog.vault.application.port.in.VaultNoteUseCase;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class PageExistenceCheckerTest {

    private PostUseCase postUseCase;
    private CategoryUseCase categoryUseCase;
    private TagUseCase tagUseCase;
    private TagCatalogUseCase tagCatalogUseCase;
    private FeedUseCase feedUseCase;
    private VaultNoteUseCase vaultNoteUseCase;
    private UserProfileUseCase userProfileUseCase;
    private PageExistenceChecker checker;

    @BeforeEach
    void setUp() {
        postUseCase = mock(PostUseCase.class);
        categoryUseCase = mock(CategoryUseCase.class);
        tagUseCase = mock(TagUseCase.class);
        tagCatalogUseCase = mock(TagCatalogUseCase.class);
        feedUseCase = mock(FeedUseCase.class);
        vaultNoteUseCase = mock(VaultNoteUseCase.class);
        userProfileUseCase = mock(UserProfileUseCase.class);
        checker =
                new PageExistenceChecker(
                        postUseCase,
                        categoryUseCase,
                        tagUseCase,
                        tagCatalogUseCase,
                        feedUseCase,
                        vaultNoteUseCase,
                        userProfileUseCase);
    }

    @Test
    void acceptsOnlyKnownStaticSubPages() {
        assertThat(checker.exists("/login/recovery")).isTrue();
        assertThat(checker.exists("/info/pawpong")).isTrue();
        assertThat(checker.exists("/admin-night/ai-agent-bloom")).isTrue();

        assertThat(checker.exists("/login/not-found")).isFalse();
        assertThat(checker.exists("/info/not-found")).isFalse();
        assertThat(checker.exists("/admin-night/not-found")).isFalse();
    }

    @Test
    void checksCategoryAndPostRoutesWithDifferentResources() {
        when(categoryUseCase.getBySlug("java")).thenReturn(mock(Category.class));
        when(postUseCase.existsBySlug("spring-cache")).thenReturn(true);

        assertThat(checker.exists("/blog/java")).isTrue();
        assertThat(checker.exists("/blog/java/spring-cache")).isTrue();

        verify(categoryUseCase).getBySlug("java");
        verify(postUseCase).existsBySlug("spring-cache");
    }

    @Test
    void checksBlogTagBeforeTreatingItAsPost() {
        when(tagUseCase.getBySlug("ai-agent")).thenReturn(mock(Tag.class));

        assertThat(checker.exists("/blog/tags/ai-agent")).isTrue();

        verify(tagUseCase).getBySlug("ai-agent");
        verify(postUseCase, never()).existsBySlug("ai-agent");
    }

    @Test
    void checksUnifiedTagAgainstTheSharedTagIndex() {
        when(tagCatalogUseCase.getIndex())
                .thenReturn(
                        java.util.List.of(
                                new TagUsage("tag-1", "AI Agent", "ai-agent", null, null, 1, 2)));

        assertThat(checker.exists("/tags/AI%20Agent")).isTrue();
        assertThat(checker.exists("/tags/ai-agent")).isTrue();
        assertThat(checker.exists("/tags/not-real")).isFalse();
    }

    @Test
    void checksVaultWithoutLoadingTheFullNote() {
        when(vaultNoteUseCase.existsBySlug("architecture")).thenReturn(true);

        assertThat(checker.exists("/vault/architecture")).isTrue();

        verify(vaultNoteUseCase).existsBySlug("architecture");
        verify(vaultNoteUseCase, never()).getBySlugWithView("architecture");
    }

    @Test
    void checksPublicProfileOwner() {
        when(userProfileUseCase.getPublicProfile("kscold"))
                .thenReturn(mock(PublicProfileResponse.class));

        assertThat(checker.exists("/profile/kscold")).isTrue();
        assertThat(checker.exists("/profile/missing")).isFalse();
    }
}
