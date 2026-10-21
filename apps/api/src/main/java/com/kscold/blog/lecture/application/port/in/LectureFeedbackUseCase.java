package com.kscold.blog.lecture.application.port.in;

import com.kscold.blog.lecture.application.dto.SubmitFeedbackCommand;
import com.kscold.blog.lecture.domain.model.LectureFeedback;
import java.util.List;

public interface LectureFeedbackUseCase {
    void submit(SubmitFeedbackCommand command);

    List<LectureFeedback> getRecent();
}
