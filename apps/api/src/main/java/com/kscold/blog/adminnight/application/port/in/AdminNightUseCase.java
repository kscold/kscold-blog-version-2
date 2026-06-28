package com.kscold.blog.adminnight.application.port.in;

import com.kscold.blog.adminnight.application.dto.AdminNightCreateCommand;
import com.kscold.blog.adminnight.application.dto.AdminNightDecisionCommand;
import com.kscold.blog.adminnight.application.dto.AdminNightProgramVoteCommand;
import com.kscold.blog.adminnight.domain.model.AdminNightRequest;
import com.kscold.blog.adminnight.domain.model.AdminNightProgramVote;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AdminNightUseCase {

    AdminNightRequest createRequest(String userId, AdminNightCreateCommand command);

    List<AdminNightRequest> getMyRequests(String userId);

    List<AdminNightRequest> getRequests(AdminNightRequest.Status status);

    List<AdminNightRequest> getApprovedRequests(LocalDate from, LocalDate to);

    AdminNightRequest resubmit(String requestId, String userId, AdminNightCreateCommand command);

    AdminNightRequest approve(String requestId, String adminUserId, AdminNightDecisionCommand command);

    AdminNightRequest requestMoreInfo(String requestId, String adminUserId, String reviewNote);

    AdminNightRequest reject(String requestId, String adminUserId, String reviewNote);

    AdminNightProgramVote upsertProgramVote(String programKey, String userId, AdminNightProgramVoteCommand command);

    Optional<AdminNightProgramVote> getMyProgramVote(String programKey, String userId);

    List<AdminNightProgramVote> getProgramVotes(String programKey);
}
