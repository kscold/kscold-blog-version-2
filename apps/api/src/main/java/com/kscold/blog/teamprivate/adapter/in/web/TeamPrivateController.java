package com.kscold.blog.teamprivate.adapter.in.web;

import com.kscold.blog.shared.web.ApiResponse;
import com.kscold.blog.teamprivate.adapter.in.web.dto.request.PasswordRequest;
import com.kscold.blog.teamprivate.adapter.in.web.dto.request.UpsertTeamPrivateDocRequest;
import com.kscold.blog.teamprivate.adapter.in.web.dto.response.TeamPrivateDocResponse;
import com.kscold.blog.teamprivate.application.port.in.TeamPrivateUseCase;
import jakarta.validation.Valid;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/team")
@RequiredArgsConstructor
public class TeamPrivateController {

    private final TeamPrivateUseCase teamPrivateUseCase;

    @Value("${team.private.password}")
    private String privatePassword;

    @PostMapping("/private")
    public ResponseEntity<ApiResponse<TeamPrivateDocResponse>> getPrivateDocs(
            @Valid @RequestBody PasswordRequest request) {
        if (!MessageDigest.isEqual(
                privatePassword.getBytes(StandardCharsets.UTF_8),
                (request.getPassword() != null ? request.getPassword() : "")
                        .getBytes(StandardCharsets.UTF_8))) {
            return ResponseEntity.status(403).body(ApiResponse.error("FORBIDDEN", "비밀번호가 틀렸습니다"));
        }

        String teamId = request.getTeamId() != null ? request.getTeamId() : "pawpong";
        return ResponseEntity.ok(
                ApiResponse.success(
                        TeamPrivateDocResponse.from(
                                teamPrivateUseCase.findByTeamId(teamId).orElse(null))));
    }

    @GetMapping("/admin/private/{teamId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<TeamPrivateDocResponse>> getPrivateDocAdmin(
            @PathVariable String teamId) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        TeamPrivateDocResponse.from(
                                teamPrivateUseCase.findByTeamId(teamId).orElse(null))));
    }

    @PutMapping("/admin/private/{teamId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<TeamPrivateDocResponse>> upsertPrivateDoc(
            @PathVariable String teamId, @Valid @RequestBody UpsertTeamPrivateDocRequest request) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        TeamPrivateDocResponse.from(
                                teamPrivateUseCase.upsert(teamId, request.toDomain())),
                        "저장되었습니다"));
    }
}
