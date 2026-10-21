package com.kscold.blog.lecture.adapter.out.persistence;

import com.kscold.blog.lecture.domain.model.LectureFeedback;
import com.kscold.blog.lecture.domain.port.out.LectureFeedbackRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class LectureFeedbackRepositoryAdapter implements LectureFeedbackRepository {
    private final MongoTemplate mongoTemplate;

    @Override
    public void insertOnce(LectureFeedback feedback) {
        try {
            mongoTemplate.insert(feedback);
        } catch (DuplicateKeyException ignored) {
            // 같은 제출 식별자의 재시도는 성공으로 처리하고 기존 응답을 덮어쓰지 않는다.
        }
    }

    @Override
    public List<LectureFeedback> findRecent() {
        return mongoTemplate.find(
                new Query().with(Sort.by(Sort.Direction.DESC, "createdAt")).limit(1000),
                LectureFeedback.class);
    }
}
