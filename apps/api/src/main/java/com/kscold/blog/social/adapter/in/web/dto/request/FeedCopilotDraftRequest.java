package com.kscold.blog.social.adapter.in.web.dto.request;

import com.kscold.blog.social.application.dto.command.FeedCopilotDraftCommand;
import jakarta.validation.constraints.Size;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class FeedCopilotDraftRequest {

    @Size(max = 4000, message = "메모는 4,000자 이내로 입력해주세요")
    private String memo;

    @Size(max = 2048, message = "URL은 2,048자 이내로 입력해주세요")
    private String sourceUrl;

    @Size(max = 5, message = "문체는 최대 5개까지 선택할 수 있습니다")
    private List<@Size(max = 24, message = "문체 값이 너무 깁니다") String> styles;

    @Size(max = 240, message = "첫 문장 제안은 240자 이내로 입력해주세요")
    private String planTitle;

    @Size(max = 500, message = "기록 관점은 500자 이내로 입력해주세요")
    private String planAngle;

    @Size(max = 4, message = "핵심 흐름은 최대 4개까지 입력할 수 있습니다")
    private List<@Size(max = 180, message = "핵심 흐름 항목이 너무 깁니다") String> planKeyPoints;

    public FeedCopilotDraftCommand toCommand() {
        return FeedCopilotDraftCommand.builder()
                .memo(memo)
                .sourceUrl(sourceUrl)
                .styles(styles)
                .planTitle(planTitle)
                .planAngle(planAngle)
                .planKeyPoints(planKeyPoints)
                .build();
    }
}
