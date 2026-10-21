package com.kscold.blog.lecture.application.dto;

import java.util.List;
import java.util.Map;

public record SubmitFeedbackCommand(
        String submissionId,
        Map<String, Integer> ratings,
        String pace,
        List<String> helpful,
        String comment) {}
