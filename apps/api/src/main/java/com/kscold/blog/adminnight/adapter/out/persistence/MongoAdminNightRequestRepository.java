package com.kscold.blog.adminnight.adapter.out.persistence;

import com.kscold.blog.adminnight.domain.model.AdminNightRequest;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

public interface MongoAdminNightRequestRepository
        extends MongoRepository<AdminNightRequest, String> {

    List<AdminNightRequest> findByUserIdOrderByCreatedAtDesc(String userId);

    List<AdminNightRequest> findByStatusOrderByCreatedAtDesc(AdminNightRequest.Status status);

    @Query(
            value = "{ 'status': ?0, 'scheduledSlot.date': { '$gte': ?1, '$lte': ?2 } }",
            sort = "{ 'scheduledSlot.date': 1 }")
    List<AdminNightRequest> findScheduledBetweenInclusive(
            AdminNightRequest.Status status, LocalDate from, LocalDate to);

    List<AdminNightRequest> findAllByOrderByCreatedAtDesc();
}
