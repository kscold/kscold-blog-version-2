package com.kscold.blog.social.adapter.in.web;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import com.kscold.blog.analytics.application.service.ViewCounter;
import com.kscold.blog.exception.ResourceNotFoundException;
import com.kscold.blog.identity.application.port.in.UserQueryPort;
import com.kscold.blog.shared.web.ClientIdentifierResolver;
import com.kscold.blog.social.adapter.in.web.dto.request.FeedLikeRequest;
import com.kscold.blog.social.application.port.in.FeedUseCase;
import com.kscold.blog.social.application.service.FeedAccessPolicy;
import com.kscold.blog.social.domain.model.Feed;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

class FeedLikeControllerTest {
    private final FeedUseCase useCase = mock(FeedUseCase.class);
    private final ClientIdentifierResolver resolver = mock(ClientIdentifierResolver.class);
    private final FeedAccessPolicy policy = mock(FeedAccessPolicy.class);
    private final HttpServletRequest request = mock(HttpServletRequest.class);
    private final FeedController controller =
            new FeedController(
                    useCase, resolver, mock(ViewCounter.class), mock(UserQueryPort.class), policy);

    @AfterEach
    void clearContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void anonymousUsesHashedIdentifierAndExplicitState() {
        when(resolver.resolve(request)).thenReturn("hashed-visitor");
        when(useCase.setLike("feed", "hashed-visitor", true)).thenReturn(Feed.builder().build());
        controller.setLike("feed", new FeedLikeRequest(true), request);
        verify(policy).requireReadable("feed", null, false);
        verify(useCase).setLike("feed", "hashed-visitor", true);
    }

    @Test
    void authenticatedUsesAccountWithoutAnonymousLookup() {
        SecurityContextHolder.getContext()
                .setAuthentication(
                        new UsernamePasswordAuthenticationToken("account", null, List.of()));
        when(useCase.setLike("feed", "account", false)).thenReturn(Feed.builder().build());
        controller.setLike("feed", new FeedLikeRequest(false), request);
        verify(policy).requireReadable("feed", "account", false);
        verify(useCase).setLike("feed", "account", false);
        verifyNoInteractions(resolver);
    }

    @Test
    void privateFeedIsRejectedBeforeMutation() {
        when(resolver.resolve(request)).thenReturn("hashed-visitor");
        doThrow(ResourceNotFoundException.feed("private"))
                .when(policy)
                .requireReadable("private", null, false);
        assertThatThrownBy(() -> controller.setLike("private", new FeedLikeRequest(true), request))
                .isInstanceOf(ResourceNotFoundException.class);
        verifyNoInteractions(useCase);
    }
}
