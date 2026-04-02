package com.kscold.blog.guestbook.adapter.in.web;

import com.kscold.blog.guestbook.adapter.in.web.dto.GuestbookEntryResponse;
import com.kscold.blog.guestbook.application.dto.GuestbookEntryCreateCommand;
import com.kscold.blog.guestbook.application.port.in.GuestbookUseCase;
import com.kscold.blog.guestbook.domain.model.GuestbookEntry;
import com.kscold.blog.shared.web.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/guestbook")
@RequiredArgsConstructor
public class GuestbookController {

    private final GuestbookUseCase guestbookUseCase;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<GuestbookEntryResponse>>> getEntries(
            @AuthenticationPrincipal String userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<GuestbookEntry> entries = guestbookUseCase.getEntries(pageable);
        boolean isAdmin = hasAdminRole();
        return ResponseEntity.ok(ApiResponse.success(entries.map(entry -> GuestbookEntryResponse.from(entry, userId, isAdmin))));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<GuestbookEntryResponse>> createEntry(
            @AuthenticationPrincipal String userId,
            @Valid @RequestBody GuestbookEntryCreateCommand command
    ) {
        GuestbookEntry entry = guestbookUseCase.create(command, userId);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(GuestbookEntryResponse.from(entry, userId, hasAdminRole()), "방명록이 작성되었습니다"));
    }

    @DeleteMapping("/{entryId}")
    public ResponseEntity<Void> deleteEntry(
            @PathVariable String entryId,
            @AuthenticationPrincipal String userId
    ) {
        guestbookUseCase.delete(entryId, userId);
        return ResponseEntity.noContent().build();
    }

    private boolean hasAdminRole() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null && auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
    }
}
