package com.kscold.blog.adminnight.domain.port.out;

import com.kscold.blog.adminnight.domain.model.AdminNightProgramVote;
import java.util.List;
import java.util.Optional;

public interface AdminNightProgramVoteRepository {

    AdminNightProgramVote save(AdminNightProgramVote vote);

    Optional<AdminNightProgramVote> findByProgramKeyAndUserId(String programKey, String userId);

    Optional<AdminNightProgramVote> findByProgramKeyAndContactEmail(
            String programKey, String contactEmail);

    List<AdminNightProgramVote> findByProgramKeyOrderByCreatedAtDesc(String programKey);
}
