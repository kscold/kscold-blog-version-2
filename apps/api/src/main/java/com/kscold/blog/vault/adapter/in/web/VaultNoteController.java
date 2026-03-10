package com.kscold.blog.vault.adapter.in.web;

import com.kscold.blog.shared.web.ApiResponse;
import com.kscold.blog.vault.adapter.in.web.dto.VaultNoteResponse;
import com.kscold.blog.vault.application.dto.GraphDataResponse;
import com.kscold.blog.vault.application.dto.NoteCreateCommand;
import com.kscold.blog.vault.application.dto.NoteUpdateCommand;
import com.kscold.blog.vault.application.port.in.VaultNoteUseCase;
import com.kscold.blog.vault.domain.model.VaultNote;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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

@Slf4j
@RestController
@RequestMapping("/api/vault/notes")
@RequiredArgsConstructor
public class VaultNoteController {

    private final VaultNoteUseCase vaultNoteUseCase;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<VaultNoteResponse>>> getAllNotes(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "updatedAt"));
        Page<VaultNote> notes = vaultNoteUseCase.getAll(pageable);
        return ResponseEntity.ok(ApiResponse.success(notes.map(VaultNoteResponse::from)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<VaultNoteResponse>> getNoteById(@PathVariable String id) {
        VaultNote note = vaultNoteUseCase.getById(id);
        return ResponseEntity.ok(ApiResponse.success(VaultNoteResponse.from(note)));
    }

    @GetMapping("/slug/{slug}")
    public ResponseEntity<ApiResponse<VaultNoteResponse>> getNoteBySlug(@PathVariable String slug) {
        VaultNote note = vaultNoteUseCase.getBySlugWithView(slug);
        return ResponseEntity.ok(ApiResponse.success(VaultNoteResponse.from(note)));
    }

    @GetMapping("/folder/{folderId}")
    public ResponseEntity<ApiResponse<Page<VaultNoteResponse>>> getNotesByFolder(
            @PathVariable String folderId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "title"));
        Page<VaultNote> notes = vaultNoteUseCase.getByFolder(folderId, pageable);
        return ResponseEntity.ok(ApiResponse.success(notes.map(VaultNoteResponse::from)));
    }

    @GetMapping("/{id}/backlinks")
    public ResponseEntity<ApiResponse<List<VaultNoteResponse>>> getBacklinks(@PathVariable String id) {
        List<VaultNote> backlinks = vaultNoteUseCase.getBackreferences(id);
        List<VaultNoteResponse> response = backlinks.stream().map(VaultNoteResponse::from).toList();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/graph")
    public ResponseEntity<ApiResponse<GraphDataResponse>> getGraphData() {
        return ResponseEntity.ok(ApiResponse.success(vaultNoteUseCase.getGraphData()));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<Page<VaultNoteResponse>>> searchNotes(
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        Page<VaultNote> notes = vaultNoteUseCase.search(q, pageable);
        return ResponseEntity.ok(ApiResponse.success(notes.map(VaultNoteResponse::from)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<VaultNoteResponse>> createNote(
            @Valid @RequestBody NoteCreateCommand command,
            @AuthenticationPrincipal String userId
    ) {
        VaultNote note = vaultNoteUseCase.create(command, userId);
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
        VaultNote note = vaultNoteUseCase.update(id, command);
        return ResponseEntity.ok(ApiResponse.success(VaultNoteResponse.from(note), "노트가 수정되었습니다"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteNote(@PathVariable String id) {
        vaultNoteUseCase.delete(id);
        return ResponseEntity.noContent().build();
    }
}
