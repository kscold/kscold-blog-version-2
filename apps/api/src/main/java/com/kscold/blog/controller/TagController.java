package com.kscold.blog.controller;

import com.kscold.blog.dto.request.TagRequest;
import com.kscold.blog.dto.response.ApiResponse;
import com.kscold.blog.dto.response.TagResponse;
import com.kscold.blog.model.Tag;
import com.kscold.blog.service.TagService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 태그 관련 REST API 컨트롤러
 */
@RestController
@RequestMapping("/api/tags")
@RequiredArgsConstructor
public class TagController {

    private final TagService tagService;

    /**
     * 전체 태그 조회
     * GET /api/tags
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<TagResponse>>> getAllTags() {
        List<Tag> tags = tagService.getAll();
        List<TagResponse> response = TagResponse.from(tags);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * 특정 태그 조회 (ID)
     * GET /api/tags/:id
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TagResponse>> getTagById(
            @PathVariable String id
    ) {
        Tag tag = tagService.getById(id);
        TagResponse response = TagResponse.from(tag);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * 특정 태그 조회 (Slug)
     * GET /api/tags/slug/:slug
     */
    @GetMapping("/slug/{slug}")
    public ResponseEntity<ApiResponse<TagResponse>> getTagBySlug(
            @PathVariable String slug
    ) {
        Tag tag = tagService.getBySlug(slug);
        TagResponse response = TagResponse.from(tag);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * 태그 생성 (ADMIN 권한 필요)
     * POST /api/tags
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<TagResponse>> createTag(
            @Valid @RequestBody TagRequest request
    ) {
        Tag tag = tagService.create(request);
        TagResponse response = TagResponse.from(tag);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "태그가 생성되었습니다"));
    }

    /**
     * 태그 수정 (ADMIN 권한 필요)
     * PUT /api/tags/:id
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<TagResponse>> updateTag(
            @PathVariable String id,
            @Valid @RequestBody TagRequest request
    ) {
        Tag tag = tagService.update(id, request);
        TagResponse response = TagResponse.from(tag);

        return ResponseEntity.ok(ApiResponse.success(response, "태그가 수정되었습니다"));
    }

    /**
     * 태그 삭제 (ADMIN 권한 필요)
     * DELETE /api/tags/:id
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteTag(
            @PathVariable String id
    ) {
        tagService.delete(id);

        return ResponseEntity.ok(ApiResponse.successWithMessage("태그가 삭제되었습니다"));
    }

    /**
     * 태그 이름으로 조회 또는 자동 생성 (ADMIN 권한 필요)
     * POST /api/tags/find-or-create
     */
    @PostMapping("/find-or-create")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<TagResponse>> findOrCreateTag(
            @Valid @RequestBody TagRequest request
    ) {
        Tag tag = tagService.findOrCreateByName(request.getName());
        TagResponse response = TagResponse.from(tag);

        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
