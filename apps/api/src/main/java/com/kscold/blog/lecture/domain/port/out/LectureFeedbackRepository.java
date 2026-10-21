package com.kscold.blog.lecture.domain.port.out;

import com.kscold.blog.lecture.domain.model.LectureFeedback;
import java.util.List;

public interface LectureFeedbackRepository {
    void insertOnce(LectureFeedback feedback);

    List<LectureFeedback> findRecent();
}
