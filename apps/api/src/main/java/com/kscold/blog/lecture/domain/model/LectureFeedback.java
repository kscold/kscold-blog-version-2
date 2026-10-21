package com.kscold.blog.lecture.domain.model;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "lecture_feedback")
public class LectureFeedback {
    @Id private String id;
    private Map<String, Integer> ratings;
    private String pace;
    private List<String> helpful;
    private String comment;
    private Instant createdAt;
}
