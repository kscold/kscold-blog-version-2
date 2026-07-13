package com.kscold.blog.vault.agent.adapter.in.web;

import com.kscold.blog.shared.web.ApiResponse;
import com.kscold.blog.vault.agent.application.dto.response.AgentRunResponse;
import com.kscold.blog.vault.agent.application.service.VaultAgentGovernanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/admin/vault/agent")
@PreAuthorize("hasRole('ADMIN')")
public class VaultAgentGovernanceController {

    private final VaultAgentGovernanceService governanceService;

    @GetMapping("/runs")
    public ResponseEntity<ApiResponse<Page<AgentRunResponse>>> getRuns(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        var pageable =
                PageRequest.of(
                        Math.max(page, 0),
                        Math.min(Math.max(size, 1), 50),
                        Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(ApiResponse.success(governanceService.getRuns(pageable)));
    }
}
