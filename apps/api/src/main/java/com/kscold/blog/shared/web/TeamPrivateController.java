package com.kscold.blog.shared.web;

import com.kscold.blog.shared.domain.model.TeamPrivateDoc;
import com.kscold.blog.shared.domain.repository.TeamPrivateDocRepository;
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

    private final TeamPrivateDocRepository repository;

    @Value("${team.private.password}")
    private String privatePassword;

    /**
     * 비밀번호 검증 후 팀 민감 정보 반환 (공개 API)
     */
    @PostMapping("/private")
    public ResponseEntity<ApiResponse<TeamPrivateDoc>> getPrivateDocs(@Valid @RequestBody PasswordRequest request) {
        if (!MessageDigest.isEqual(
                privatePassword.getBytes(StandardCharsets.UTF_8),
                (request.getPassword() != null ? request.getPassword() : "").getBytes(StandardCharsets.UTF_8))) {
            return ResponseEntity.status(403).body(ApiResponse.error("FORBIDDEN", "비밀번호가 틀렸습니다"));
        }

        String teamId = request.getTeamId() != null ? request.getTeamId() : "pawpong";
        TeamPrivateDoc doc = repository.findByTeamId(teamId).orElse(null);

        if (doc == null) {
            return ResponseEntity.ok(ApiResponse.success(null));
        }

        return ResponseEntity.ok(ApiResponse.success(doc));
    }

    /**
     * 관리자: 팀 민감 정보 조회
     */
    @GetMapping("/admin/private/{teamId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<TeamPrivateDoc>> getPrivateDocAdmin(@PathVariable String teamId) {
        TeamPrivateDoc doc = repository.findByTeamId(teamId).orElse(null);
        return ResponseEntity.ok(ApiResponse.success(doc));
    }

    /**
     * 관리자: 팀 민감 정보 생성/수정
     */
    @PutMapping("/admin/private/{teamId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<TeamPrivateDoc>> upsertPrivateDoc(
            @PathVariable String teamId,
            @Valid @RequestBody TeamPrivateDoc doc
    ) {
        TeamPrivateDoc existing = repository.findByTeamId(teamId).orElse(null);
        if (existing != null) {
            doc.setId(existing.getId());
        }
        doc.setTeamId(teamId);
        TeamPrivateDoc saved = repository.save(doc);
        return ResponseEntity.ok(ApiResponse.success(saved, "저장되었습니다"));
    }

    @Data
    static class PasswordRequest {
        private String password;
        private String teamId;
    }
}
