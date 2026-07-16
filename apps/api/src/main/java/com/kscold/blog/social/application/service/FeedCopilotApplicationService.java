package com.kscold.blog.social.application.service;

import com.kscold.blog.exception.BusinessException;
import com.kscold.blog.exception.ErrorCode;
import com.kscold.blog.exception.InvalidRequestException;
import com.kscold.blog.social.application.dto.command.FeedCopilotDraftCommand;
import com.kscold.blog.social.application.dto.command.FeedCopilotPlanCommand;
import com.kscold.blog.social.application.dto.response.FeedCopilotDraftResponse;
import com.kscold.blog.social.application.dto.response.FeedCopilotPlanResponse;
import com.kscold.blog.social.application.port.in.FeedCopilotUseCase;
import com.kscold.blog.social.domain.exception.FeedCopilotUnavailableException;
import com.kscold.blog.social.domain.model.ExternalArticle;
import com.kscold.blog.social.domain.model.FeedCopilotPlan;
import com.kscold.blog.social.domain.port.out.FeedCopilotProvider;
import com.kscold.blog.social.domain.port.out.LinkScrapingPort;
import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class FeedCopilotApplicationService implements FeedCopilotUseCase {

    private static final Set<String> AVAILABLE_STYLES =
            Set.of("short", "developer", "candid", "calm", "warm");
    private static final Set<String> AVAILABLE_STYLE_REFERENCE_TYPES =
            Set.of("vault", "blog", "feed", "profile");

    private final LinkScrapingPort linkScrapingPort;
    private final FeedCopilotProvider feedCopilotProvider;

    @Override
    public FeedCopilotPlanResponse createPlan(FeedCopilotPlanCommand command, String userId) {
        ExternalArticle article = extractArticle(command.getSourceUrl());
        validateSource(command.getMemo(), article);

        try {
            return FeedCopilotPlanResponse.from(
                    feedCopilotProvider.createPlan(
                            normalizeText(command.getMemo()),
                            article,
                            normalizeStyles(command.getStyles()),
                            userId));
        } catch (FeedCopilotUnavailableException exception) {
            throw unavailable(exception);
        }
    }

    @Override
    public FeedCopilotDraftResponse createDraft(FeedCopilotDraftCommand command, String userId) {
        ExternalArticle article = extractArticle(command.getSourceUrl());
        validateSource(command.getMemo(), article);

        FeedCopilotPlan plan =
                new FeedCopilotPlan(
                        normalizeText(command.getPlanTitle()),
                        normalizeText(command.getPlanAngle()),
                        normalizeTextList(command.getPlanKeyPoints()),
                        "",
                        List.of());
        try {
            return FeedCopilotDraftResponse.from(
                    feedCopilotProvider.createDraft(
                            normalizeText(command.getMemo()),
                            article,
                            normalizeStyles(command.getStyles()),
                            plan,
                            normalizeStyleReferenceKeys(command.getStyleReferenceKeys()),
                            userId));
        } catch (FeedCopilotUnavailableException exception) {
            throw unavailable(exception);
        }
    }

    private ExternalArticle extractArticle(String sourceUrl) {
        if (!StringUtils.hasText(sourceUrl)) {
            return ExternalArticle.empty();
        }
        return linkScrapingPort.extract(sourceUrl.trim());
    }

    private void validateSource(String memo, ExternalArticle article) {
        if (!StringUtils.hasText(memo) && !article.hasReadableContent()) {
            throw InvalidRequestException.invalidInput("메모나 읽을 수 있는 외부 URL을 입력해주세요");
        }
    }

    private List<String> normalizeStyles(List<String> styles) {
        if (styles == null) {
            return List.of();
        }
        return styles.stream()
                .filter(StringUtils::hasText)
                .map(String::trim)
                .filter(AVAILABLE_STYLES::contains)
                .distinct()
                .toList();
    }

    private List<String> normalizeTextList(List<String> values) {
        if (values == null) {
            return List.of();
        }
        return values.stream().filter(StringUtils::hasText).map(String::trim).distinct().toList();
    }

    private List<String> normalizeStyleReferenceKeys(List<String> values) {
        if (values == null) {
            return List.of();
        }
        return values.stream()
                .filter(StringUtils::hasText)
                .map(String::trim)
                .filter(this::isSupportedStyleReferenceKey)
                .distinct()
                .limit(2)
                .toList();
    }

    private boolean isSupportedStyleReferenceKey(String value) {
        String[] parts = value.split(":", 2);
        return parts.length == 2
                && AVAILABLE_STYLE_REFERENCE_TYPES.contains(parts[0])
                && StringUtils.hasText(parts[1]);
    }

    private String normalizeText(String value) {
        return value == null ? "" : value.trim();
    }

    private BusinessException unavailable(FeedCopilotUnavailableException exception) {
        return new BusinessException(ErrorCode.EXTERNAL_API_ERROR, exception.getMessage());
    }
}
