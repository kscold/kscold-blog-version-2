package com.kscold.blog.social.domain.port.out;

import com.kscold.blog.social.domain.model.ExternalArticle;
import com.kscold.blog.social.domain.model.FeedCopilotDraft;
import com.kscold.blog.social.domain.model.FeedCopilotPlan;
import java.util.List;

/** 피드 작성용 계획과 초안을 생성하는 외부 Agent 포트입니다. */
public interface FeedCopilotProvider {

    FeedCopilotPlan createPlan(
            String memo, ExternalArticle externalArticle, List<String> styles, String userId);

    FeedCopilotDraft createDraft(
            String memo,
            ExternalArticle externalArticle,
            List<String> styles,
            FeedCopilotPlan plan,
            List<String> styleReferenceKeys,
            String userId);
}
