package com.kscold.blog.blog.domain.port.out;

import com.kscold.blog.blog.domain.model.AccessRequest;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface AccessRequestRepository extends MongoRepository<AccessRequest, String> {

    Optional<AccessRequest> findByUserIdAndCategoryId(String userId, String categoryId);

    List<AccessRequest> findByStatus(AccessRequest.Status status);

    List<AccessRequest> findByUserId(String userId);

    List<AccessRequest> findByUserIdAndStatus(String userId, AccessRequest.Status status);
}
