package com.kscold.blog.adminnight.adapter.out.persistence;

import com.kscold.blog.adminnight.domain.model.AdminNightRequest;
import com.kscold.blog.adminnight.domain.port.out.AdminNightRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@SuppressWarnings("null")
@Component
@RequiredArgsConstructor
public class AdminNightRequestRepositoryAdapter implements AdminNightRequestRepository {

    private final MongoAdminNightRequestRepository mongoAdminNightRequestRepository;

    @Override
    public AdminNightRequest save(AdminNightRequest request) {
        return mongoAdminNightRequestRepository.save(request);
    }

    @Override
    public Optional<AdminNightRequest> findById(String id) {
        return mongoAdminNightRequestRepository.findById(id);
    }

    @Override
    public List<AdminNightRequest> findByUserIdOrderByCreatedAtDesc(String userId) {
        return mongoAdminNightRequestRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Override
    public List<AdminNightRequest> findByStatusOrderByCreatedAtDesc(AdminNightRequest.Status status) {
        return mongoAdminNightRequestRepository.findByStatusOrderByCreatedAtDesc(status);
    }

    @Override
    public List<AdminNightRequest> findAllByOrderByCreatedAtDesc() {
        return mongoAdminNightRequestRepository.findAllByOrderByCreatedAtDesc();
    }
}
