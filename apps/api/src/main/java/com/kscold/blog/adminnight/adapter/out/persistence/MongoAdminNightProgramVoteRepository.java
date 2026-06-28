package com.kscold.blog.adminnight.adapter.out.persistence;

import com.kscold.blog.adminnight.domain.model.AdminNightProgramVote;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface MongoAdminNightProgramVoteRepository extends MongoRepository<AdminNightProgramVote, String> {

    Optional<AdminNightProgramVote> findByProgramKeyAndUserId(String programKey, String userId);

    Optional<AdminNightProgramVote> findByProgramKeyAndContactEmail(String programKey, String contactEmail);

    List<AdminNightProgramVote> findByProgramKeyOrderByCreatedAtDesc(String programKey);
}
