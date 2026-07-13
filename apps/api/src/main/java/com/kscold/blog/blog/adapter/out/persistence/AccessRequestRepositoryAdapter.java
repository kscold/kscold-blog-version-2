package com.kscold.blog.blog.adapter.out.persistence;

import com.kscold.blog.blog.domain.model.AccessRequest;
import com.kscold.blog.blog.domain.port.out.AccessRequestRepository;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/** AccessRequestRepository 포트의 영속성 어댑터 Spring Data MongoDB를 사용하여 포트 인터페이스를 구현 */
@SuppressWarnings("null")
@Component
@RequiredArgsConstructor
public class AccessRequestRepositoryAdapter implements AccessRequestRepository {

    private final MongoAccessRequestRepository mongoAccessRequestRepository;

    @Override
    public AccessRequest save(AccessRequest accessRequest) {
        return mongoAccessRequestRepository.save(accessRequest);
    }

    @Override
    public Optional<AccessRequest> findById(String id) {
        return mongoAccessRequestRepository.findById(id);
    }

    @Override
    public Optional<AccessRequest> findByUserIdAndPostId(String userId, String postId) {
        return mongoAccessRequestRepository.findByUserIdAndPostId(userId, postId);
    }

    @Override
    public List<AccessRequest> findAllByUserIdAndCategoryId(String userId, String categoryId) {
        return mongoAccessRequestRepository.findAllByUserIdAndCategoryId(userId, categoryId);
    }

    @Override
    public List<AccessRequest> findByStatusOrderByCreatedAtDesc(AccessRequest.Status status) {
        return mongoAccessRequestRepository.findByStatusOrderByCreatedAtDesc(status);
    }

    @Override
    public List<AccessRequest> findByUserIdOrderByCreatedAtDesc(String userId) {
        return mongoAccessRequestRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }
}
