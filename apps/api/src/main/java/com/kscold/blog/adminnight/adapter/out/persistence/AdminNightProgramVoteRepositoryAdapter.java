package com.kscold.blog.adminnight.adapter.out.persistence;

import com.kscold.blog.adminnight.domain.model.AdminNightProgramVote;
import com.kscold.blog.adminnight.domain.port.out.AdminNightProgramVoteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@SuppressWarnings("null")
@Component
@RequiredArgsConstructor
public class AdminNightProgramVoteRepositoryAdapter implements AdminNightProgramVoteRepository {

    private final MongoAdminNightProgramVoteRepository mongoAdminNightProgramVoteRepository;

    @Override
    public AdminNightProgramVote save(AdminNightProgramVote vote) {
        return mongoAdminNightProgramVoteRepository.save(vote);
    }

    @Override
    public Optional<AdminNightProgramVote> findByProgramKeyAndUserId(String programKey, String userId) {
        return mongoAdminNightProgramVoteRepository.findByProgramKeyAndUserId(programKey, userId);
    }

    @Override
    public List<AdminNightProgramVote> findByProgramKeyOrderByCreatedAtDesc(String programKey) {
        return mongoAdminNightProgramVoteRepository.findByProgramKeyOrderByCreatedAtDesc(programKey);
    }
}
