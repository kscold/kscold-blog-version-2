package com.kscold.blog.vault.adapter.in.web;

import com.kscold.blog.dto.response.ApiResponse;
import com.kscold.blog.dto.response.GraphDataResponse;
import com.kscold.blog.dto.response.VaultNoteResponse;
import com.kscold.blog.vault.application.dto.NoteCreateCommand;
import com.kscold.blog.vault.application.dto.NoteUpdateCommand;
import com.kscold.blog.vault.application.service.VaultNoteApplicationService;
import com.kscold.blog.vault.domain.model.VaultNote;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vault/notes")
@RequiredArgsConstructor
public class VaultNoteController {

    private final VaultNoteApplicationService vaultNoteService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<VaultNoteResponse>>> getAllNotes(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "updatedAt"));
        Page<VaultNote> notes = vaultNoteService.getAll(pageable);
        Page<VaultNoteResponse> response = notes.map(VaultNoteResponse::from);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<VaultNoteResponse>> getNoteById(@PathVariable String id) {
        VaultNote note = vaultNoteService.getById(id);
        return ResponseEntity.ok(ApiResponse.success(VaultNoteResponse.from(note)));
    }

    @GetMapping("/slug/{slug}")
    public ResponseEntity<ApiResponse<VaultNoteResponse>> getNoteBySlug(@PathVariable String slug) {
        VaultNote note = vaultNoteService.getBySlugWithView(slug);
        return ResponseEntity.ok(ApiResponse.success(VaultNoteResponse.from(note)));
    }

    @GetMapping("/folder/{folderId}")
    public ResponseEntity<ApiResponse<Page<VaultNoteResponse>>> getNotesByFolder(
            @PathVariable String folderId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "title"));
        Page<VaultNote> notes = vaultNoteService.getByFolder(folderId, pageable);
        Page<VaultNoteResponse> response = notes.map(VaultNoteResponse::from);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}/backlinks")
    public ResponseEntity<ApiResponse<List<VaultNoteResponse>>> getBacklinks(@PathVariable String id) {
        List<VaultNote> backlinks = vaultNoteService.getBackreferences(id);
        List<VaultNoteResponse> response = backlinks.stream()
                .map(VaultNoteResponse::from)
                .toList();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/graph")
    public ResponseEntity<ApiResponse<GraphDataResponse>> getGraphData() {
        GraphDataResponse graphData = vaultNoteService.getGraphData();
        return ResponseEntity.ok(ApiResponse.success(graphData));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<Page<VaultNoteResponse>>> searchNotes(
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        Page<VaultNote> notes = vaultNoteService.search(q, pageable);
        Page<VaultNoteResponse> response = notes.map(VaultNoteResponse::from);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<VaultNoteResponse>> createNote(
            @Valid @RequestBody NoteCreateCommand command,
            @AuthenticationPrincipal String userId
    ) {
        VaultNote note = vaultNoteService.create(command, userId);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(VaultNoteResponse.from(note), "노트가 생성되었습니다"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<VaultNoteResponse>> updateNote(
            @PathVariable String id,
            @Valid @RequestBody NoteUpdateCommand command
    ) {
        VaultNote note = vaultNoteService.update(id, command);
        return ResponseEntity.ok(ApiResponse.success(VaultNoteResponse.from(note), "노트가 수정되었습니다"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteNote(@PathVariable String id) {
        vaultNoteService.delete(id);
        return ResponseEntity.ok(ApiResponse.successWithMessage("노트가 삭제되었습니다"));
    }
}
