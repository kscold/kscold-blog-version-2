package com.kscold.blog.vault.agent;

import com.kscold.blog.shared.web.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import static com.kscold.blog.vault.agent.VaultAgentDtos.ChatRequest;
import static com.kscold.blog.vault.agent.VaultAgentDtos.ChatResponse;
import static com.kscold.blog.vault.agent.VaultAgentDtos.ReindexResponse;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/vault/agent")
public class VaultAgentController {

    private final VaultAgentService vaultAgentService;

    @PostMapping("/chat")
    public ResponseEntity<ApiResponse<ChatResponse>> chat(@Valid @RequestBody ChatRequest request) {
        return ResponseEntity.ok(ApiResponse.success(vaultAgentService.chat(request)));
    }

    @PostMapping("/reindex")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ReindexResponse>> reindex() {
        return ResponseEntity.ok(ApiResponse.success(vaultAgentService.reindexAll()));
    }
}
