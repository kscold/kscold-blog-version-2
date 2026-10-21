package com.kscold.blog.lecture.application.service;

import com.kscold.blog.exception.BusinessException;
import com.kscold.blog.exception.ErrorCode;
import com.kscold.blog.lecture.application.dto.SubmitFeedbackCommand;
import com.kscold.blog.lecture.application.port.in.LectureFeedbackUseCase;
import com.kscold.blog.lecture.domain.model.LectureFeedback;
import com.kscold.blog.lecture.domain.port.out.LectureFeedbackRepository;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class LectureFeedbackApplicationService implements LectureFeedbackUseCase {
    private static final Set<String> RATING_KEYS =
            Set.of("satisfaction", "understanding", "usefulness", "instruction");
    private final LectureFeedbackRepository repository;

    @Override
    public void submit(SubmitFeedbackCommand command) {
        if (!command.ratings().keySet().equals(RATING_KEYS)) {
            throw new BusinessException(ErrorCode.INVALID_INPUT_VALUE, "네 가지 평가 항목을 모두 선택해주세요.");
        }
        repository.insertOnce(
                LectureFeedback.builder()
                        .id("hansalim-20261021:" + command.submissionId())
                        .ratings(validateRatings(command.ratings()))
                        .pace(command.pace())
                        .helpful(List.copyOf(command.helpful()))
                        .comment(command.comment() == null ? "" : command.comment().strip())
                        .createdAt(Instant.now())
                        .build());
    }

    @Override
    public List<LectureFeedback> getRecent() {
        return repository.findRecent();
    }

    private Map<String, Integer> validateRatings(Map<String, Integer> ratings) {
        if (ratings.values().stream().anyMatch(value -> value == null || value < 1 || value > 5)) {
            throw new BusinessException(ErrorCode.INVALID_INPUT_VALUE, "평가는 1점부터 5점 사이여야 합니다.");
        }
        return Map.copyOf(ratings);
    }
}
