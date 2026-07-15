package com.kscold.blog.social.application.port.in;

import com.kscold.blog.social.application.dto.command.FeedCopilotDraftCommand;
import com.kscold.blog.social.application.dto.command.FeedCopilotPlanCommand;
import com.kscold.blog.social.application.dto.response.FeedCopilotDraftResponse;
import com.kscold.blog.social.application.dto.response.FeedCopilotPlanResponse;

public interface FeedCopilotUseCase {

    FeedCopilotPlanResponse createPlan(FeedCopilotPlanCommand command, String userId);

    FeedCopilotDraftResponse createDraft(FeedCopilotDraftCommand command, String userId);
}
