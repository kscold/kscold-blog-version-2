package com.kscold.blog.vault.agent;

import com.kscold.blog.shared.web.ApiResponse;
import com.kscold.blog.shared.web.ClientIdentifierResolver;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import static com.kscold.blog.vault.agent.VaultAgentDtos.ChatRequest;
import static com.kscold.blog.vault.agent.VaultAgentDtos.ChatResponse;
import static com.kscold.blog.vault.agent.VaultAgentDtos.ChatHistoryResponse;
import static com.kscold.blog.vault.agent.VaultAgentDtos.ReindexResponse;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/vault/agent")
public class VaultAgentController {

    private final VaultAgentService vaultAgentService;
    private final ClientIdentifierResolver clientIdentifierResolver;

    @PostMapping("/chat")
    public ResponseEntity<ApiResponse<ChatResponse>> chat(
            @AuthenticationPrincipal String userId,
            HttpServletRequest httpRequest,
            @Valid @RequestBody ChatRequest request
    ) {
        String clientIdentifier = clientIdentifierResolver.resolve(httpRequest);
        return ResponseEntity.ok(ApiResponse.success(vaultAgentService.chat(request, userId, clientIdentifier)));
    }

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<ChatHistoryResponse>> history(
            @AuthenticationPrincipal String userId,
            HttpServletRequest httpRequest,
            @RequestParam(required = false) String sessionId
    ) {
        String clientIdentifier = clientIdentifierResolver.resolve(httpRequest);
        return ResponseEntity.ok(ApiResponse.success(vaultAgentService.history(sessionId, userId, clientIdentifier)));
    }

    @PostMapping("/reindex")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ReindexResponse>> reindex() {
        return ResponseEntity.ok(ApiResponse.success(vaultAgentService.reindexAll()));
    }
}
