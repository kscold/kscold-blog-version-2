package com.kscold.blog.vault.agent.adapter.in.web;

import com.kscold.blog.shared.web.ApiResponse;
import com.kscold.blog.shared.web.ClientIdentifierResolver;
import com.kscold.blog.vault.agent.application.dto.command.ChatCommand;
import com.kscold.blog.vault.agent.application.dto.response.ChatHistoryResponse;
import com.kscold.blog.vault.agent.application.dto.response.ChatResponse;
import com.kscold.blog.vault.agent.application.dto.response.ReindexResponse;
import com.kscold.blog.vault.agent.application.service.VaultAgentService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/vault/agent")
public class VaultAgentController {

    private final VaultAgentService vaultAgentService;
    private final ClientIdentifierResolver clientIdentifierResolver;

    @PostMapping("/chat")
    public ResponseEntity<ApiResponse<ChatResponse>> chat(
            @AuthenticationPrincipal String userId,
            HttpServletRequest httpRequest,
            @Valid @RequestBody ChatCommand request) {
        String clientIdentifier = clientIdentifierResolver.resolve(httpRequest);
        return ResponseEntity.ok(
                ApiResponse.success(vaultAgentService.chat(request, userId, clientIdentifier)));
    }

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<ChatHistoryResponse>> history(
            @AuthenticationPrincipal String userId,
            HttpServletRequest httpRequest,
            @RequestParam(required = false) String sessionId) {
        String clientIdentifier = clientIdentifierResolver.resolve(httpRequest);
        return ResponseEntity.ok(
                ApiResponse.success(
                        vaultAgentService.history(sessionId, userId, clientIdentifier)));
    }

    @PostMapping("/reindex")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ReindexResponse>> reindex() {
        return ResponseEntity.ok(ApiResponse.success(vaultAgentService.reindexAll()));
    }
}
