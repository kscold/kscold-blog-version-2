package com.kscold.blog.blog.adapter.in.web;

import com.kscold.blog.blog.application.dto.TagCommand;
import com.kscold.blog.blog.application.port.in.TagUseCase;
import com.kscold.blog.blog.domain.model.Tag;
import com.kscold.blog.blog.adapter.in.web.dto.TagResponse;
import com.kscold.blog.shared.web.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/tags")
@RequiredArgsConstructor
public class TagController {

    private final TagUseCase tagUseCase;

    @GetMapping
    public ResponseEntity<ApiResponse<List<TagResponse>>> getAllTags() {
        List<Tag> tags = tagUseCase.getAll();
        return ResponseEntity.ok(ApiResponse.success(TagResponse.from(tags)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TagResponse>> getTagById(@PathVariable String id) {
        Tag tag = tagUseCase.getById(id);
        return ResponseEntity.ok(ApiResponse.success(TagResponse.from(tag)));
    }

    @GetMapping("/slug/{slug}")
    public ResponseEntity<ApiResponse<TagResponse>> getTagBySlug(@PathVariable String slug) {
        Tag tag = tagUseCase.getBySlug(slug);
        return ResponseEntity.ok(ApiResponse.success(TagResponse.from(tag)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<TagResponse>> createTag(@Valid @RequestBody TagCommand command) {
        Tag tag = tagUseCase.create(command);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(TagResponse.from(tag), "태그가 생성되었습니다"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<TagResponse>> updateTag(
            @PathVariable String id,
            @Valid @RequestBody TagCommand command
    ) {
        Tag tag = tagUseCase.update(id, command);
        return ResponseEntity.ok(ApiResponse.success(TagResponse.from(tag), "태그가 수정되었습니다"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteTag(@PathVariable String id) {
        tagUseCase.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/find-or-create")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<TagResponse>> findOrCreateTag(@Valid @RequestBody TagCommand command) {
        Tag tag = tagUseCase.findOrCreateByName(command.getName());
        return ResponseEntity.ok(ApiResponse.success(TagResponse.from(tag)));
    }
}
