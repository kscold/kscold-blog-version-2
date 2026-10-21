package com.kscold.blog.lecture.adapter.in.web.dto.response;

import com.kscold.blog.lecture.domain.model.LectureFeedback;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import lombok.*;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LectureFeedbackResponse {
    private String id;
    private Map<String, Integer> ratings;
    private String pace;
    private List<String> helpful;
    private String comment;
    private Instant createdAt;

    public static LectureFeedbackResponse from(LectureFeedback feedback) {
        return LectureFeedbackResponse.builder()
                .id(feedback.getId())
                .ratings(feedback.getRatings())
                .pace(feedback.getPace())
                .helpful(feedback.getHelpful())
                .comment(feedback.getComment())
                .createdAt(feedback.getCreatedAt())
                .build();
    }
}
