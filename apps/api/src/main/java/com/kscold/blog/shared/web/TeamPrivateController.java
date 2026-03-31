package com.kscold.blog.shared.web;

import com.kscold.blog.shared.application.TeamPrivateService;
import com.kscold.blog.shared.domain.model.TeamPrivateDoc;
import jakarta.validation.Valid;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

@RestController
@RequestMapping("/api/team")
@RequiredArgsConstructor
public class TeamPrivateController {

    private final TeamPrivateService teamPrivateService;

    @Value("${team.private.password}")
    private String privatePassword;

    @PostMapping("/private")
    public ResponseEntity<ApiResponse<TeamPrivateDoc>> getPrivateDocs(@Valid @RequestBody PasswordRequest request) {
        if (!MessageDigest.isEqual(
                privatePassword.getBytes(StandardCharsets.UTF_8),
                (request.getPassword() != null ? request.getPassword() : "").getBytes(StandardCharsets.UTF_8))) {
            return ResponseEntity.status(403).body(ApiResponse.error("FORBIDDEN", "비밀번호가 틀렸습니다"));
        }

        String teamId = request.getTeamId() != null ? request.getTeamId() : "pawpong";
        return ResponseEntity.ok(ApiResponse.success(teamPrivateService.findByTeamId(teamId).orElse(null)));
    }

    @GetMapping("/admin/private/{teamId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<TeamPrivateDoc>> getPrivateDocAdmin(@PathVariable String teamId) {
        return ResponseEntity.ok(ApiResponse.success(teamPrivateService.findByTeamId(teamId).orElse(null)));
    }

    @PutMapping("/admin/private/{teamId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<TeamPrivateDoc>> upsertPrivateDoc(
            @PathVariable String teamId,
            @Valid @RequestBody TeamPrivateDoc doc
    ) {
        return ResponseEntity.ok(ApiResponse.success(teamPrivateService.upsert(teamId, doc), "저장되었습니다"));
    }

    @Data
    static class PasswordRequest {
        private String password;
        private String teamId;
    }
}
