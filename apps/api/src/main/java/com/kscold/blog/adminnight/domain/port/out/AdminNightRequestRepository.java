package com.kscold.blog.adminnight.domain.port.out;

import com.kscold.blog.adminnight.domain.model.AdminNightRequest;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AdminNightRequestRepository {

    AdminNightRequest save(AdminNightRequest request);

    Optional<AdminNightRequest> findById(String id);

    List<AdminNightRequest> findByUserIdOrderByCreatedAtDesc(String userId);

    List<AdminNightRequest> findByStatusOrderByCreatedAtDesc(AdminNightRequest.Status status);

    List<AdminNightRequest> findApprovedScheduledBetween(LocalDate from, LocalDate to);

    List<AdminNightRequest> findAllByOrderByCreatedAtDesc();
}
