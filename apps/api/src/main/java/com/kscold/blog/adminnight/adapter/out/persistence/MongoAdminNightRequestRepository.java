package com.kscold.blog.adminnight.adapter.out.persistence;

import com.kscold.blog.adminnight.domain.model.AdminNightRequest;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface MongoAdminNightRequestRepository
        extends MongoRepository<AdminNightRequest, String> {

    List<AdminNightRequest> findByUserIdOrderByCreatedAtDesc(String userId);

    List<AdminNightRequest> findByStatusOrderByCreatedAtDesc(AdminNightRequest.Status status);

    List<AdminNightRequest> findAllByOrderByCreatedAtDesc();
}
