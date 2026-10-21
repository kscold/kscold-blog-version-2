package com.kscold.blog.lecture.adapter.in.web.dto.request;

import com.kscold.blog.lecture.application.dto.SubmitFeedbackCommand;
import jakarta.validation.constraints.*;
import java.util.List;
import java.util.Map;
import lombok.*;

@Getter
@Builder
@AllArgsConstructor
public class LectureFeedbackRequest {
    @NotBlank
    @Pattern(regexp = "[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}")
    private String submissionId;

    @NotNull
    @Size(min = 4, max = 4)
    private Map<
                    @Pattern(regexp = "satisfaction|understanding|usefulness|instruction") String,
                    @NotNull @Min(1) @Max(5) Integer>
            ratings;

    @NotNull
    @Pattern(regexp = "slow|right|fast")
    private String pace;

    @NotNull
    @Size(max = 5)
    private List<@NotNull @Pattern(regexp = "basics|prompt|tools|privacy|practice") String> helpful;

    @Size(max = 1000)
    private String comment;

    public SubmitFeedbackCommand toCommand() {
        return new SubmitFeedbackCommand(submissionId, ratings, pace, helpful, comment);
    }
}
