package com.kscold.blog.social.adapter.in.web;

import com.kscold.blog.shared.web.ApiResponse;
import com.kscold.blog.social.application.dto.GitHubContributionResponse;
import com.kscold.blog.social.application.dto.GitHubOverviewResponse;
import com.kscold.blog.social.application.port.in.GitHubUseCase;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/github")
@RequiredArgsConstructor
public class GitHubController {

    private final GitHubUseCase gitHubUseCase;

    @GetMapping("/{username}")
    public ResponseEntity<ApiResponse<GitHubOverviewResponse>> getOverview(@PathVariable String username) {
        return ResponseEntity.ok(ApiResponse.success(gitHubUseCase.getOverview(username)));
    }

    @GetMapping("/{username}/contributions")
    public ResponseEntity<ApiResponse<GitHubContributionResponse>> getContributions(
            @PathVariable String username,
            @RequestParam(required = false) Integer year
    ) {
        return ResponseEntity.ok(ApiResponse.success(gitHubUseCase.getContributions(username, year)));
    }
}
