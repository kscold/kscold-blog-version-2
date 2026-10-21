package com.kscold.blog.lecture;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.kscold.blog.exception.BusinessException;
import com.kscold.blog.lecture.adapter.in.web.dto.request.LectureFeedbackRequest;
import com.kscold.blog.lecture.application.dto.SubmitFeedbackCommand;
import com.kscold.blog.lecture.application.service.LectureFeedbackApplicationService;
import com.kscold.blog.lecture.domain.model.LectureFeedback;
import com.kscold.blog.lecture.domain.port.out.LectureFeedbackRepository;
import jakarta.validation.Validation;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

class LectureFeedbackTest {
    private final Map<String, Integer> ratings =
            Map.of("satisfaction", 5, "understanding", 4, "usefulness", 5, "instruction", 4);

    @Test
    void savesAnonymousFeedbackWithStableId() {
        var repository = mock(LectureFeedbackRepository.class);
        var service = new LectureFeedbackApplicationService(repository);
        service.submit(
                new SubmitFeedbackCommand(
                        "abc", ratings, "right", List.of("practice"), "  좋았어요  "));
        var saved = ArgumentCaptor.forClass(LectureFeedback.class);
        verify(repository).insertOnce(saved.capture());
        assertEquals("hansalim-20261021:abc", saved.getValue().getId());
        assertEquals("좋았어요", saved.getValue().getComment());
        assertNotNull(saved.getValue().getCreatedAt());
    }

    @Test
    void rejectsMissingQuestions() {
        var repository = mock(LectureFeedbackRepository.class);
        var service = new LectureFeedbackApplicationService(repository);
        assertThrows(
                BusinessException.class,
                () ->
                        service.submit(
                                new SubmitFeedbackCommand(
                                        "abc", Map.of("satisfaction", 5), "right", List.of(), "")));
        verifyNoInteractions(repository);
    }

    @Test
    void rejectsOutOfRangeRatings() {
        var repository = mock(LectureFeedbackRepository.class);
        var service = new LectureFeedbackApplicationService(repository);
        var invalid =
                Map.of("satisfaction", 6, "understanding", 4, "usefulness", 5, "instruction", 4);
        assertThrows(
                BusinessException.class,
                () ->
                        service.submit(
                                new SubmitFeedbackCommand("abc", invalid, "right", List.of(), "")));
        verifyNoInteractions(repository);
    }

    @Test
    void validatesRequestBoundaries() {
        try (var factory = Validation.buildDefaultValidatorFactory()) {
            var validator = factory.getValidator();
            var valid =
                    LectureFeedbackRequest.builder()
                            .submissionId("00000000-0000-4000-8000-000000000001")
                            .ratings(ratings)
                            .pace("right")
                            .helpful(List.of("privacy"))
                            .comment("")
                            .build();
            assertTrue(validator.validate(valid).isEmpty());
            var invalid =
                    LectureFeedbackRequest.builder()
                            .submissionId("../bad")
                            .ratings(Map.of("satisfaction", 6))
                            .pace("anything")
                            .helpful(List.of("unknown"))
                            .comment("a".repeat(1001))
                            .build();
            assertTrue(validator.validate(invalid).size() >= 5);
        }
    }
}
