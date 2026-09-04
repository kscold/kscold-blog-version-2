package com.kscold.blog.blog.adapter.in.web;

import com.kscold.blog.blog.adapter.in.web.dto.request.MergeTagRequest;
import com.kscold.blog.blog.adapter.in.web.dto.response.TagResponse;
import com.kscold.blog.blog.adapter.in.web.dto.response.TagUsageResponse;
import com.kscold.blog.blog.application.dto.command.TagCommand;
import com.kscold.blog.blog.application.port.in.TagCatalogUseCase;
import com.kscold.blog.blog.application.port.in.TagUseCase;
import com.kscold.blog.blog.domain.model.Tag;
import com.kscold.blog.shared.web.ApiResponse;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/tags")
@RequiredArgsConstructor
public class TagController {

    private final TagUseCase tagUseCase;
    private final TagCatalogUseCase tagCatalogUseCase;

    @GetMapping
    public ResponseEntity<ApiResponse<List<TagResponse>>> getAllTags() {
        List<Tag> tags = tagUseCase.getAll();
        return ResponseEntity.ok(ApiResponse.success(TagResponse.from(tags)));
    }

    /** 글·피드 사용량을 합친 태그 목록. 화면에서 두 API 를 따로 부르지 않도록 한 번에 내려준다. */
    @GetMapping("/index")
    public ResponseEntity<ApiResponse<List<TagUsageResponse>>> getTagIndex() {
        return ResponseEntity.ok(
                ApiResponse.success(TagUsageResponse.from(tagCatalogUseCase.getIndex())));
    }

    @PostMapping("/reindex")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Integer>> reindexTags() {
        int changed = tagCatalogUseCase.reindex();
        return ResponseEntity.ok(ApiResponse.success(changed, changed + "개의 태그를 정리했습니다"));
    }

    @PostMapping("/merge")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Long>> mergeTags(
            @Valid @RequestBody MergeTagRequest request) {
        long moved = tagCatalogUseCase.merge(request.getSourceId(), request.getTargetId());
        return ResponseEntity.ok(ApiResponse.success(moved, "태그를 합쳤습니다"));
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
    public ResponseEntity<ApiResponse<TagResponse>> createTag(
            @Valid @RequestBody TagCommand command) {
        Tag tag = tagUseCase.create(command);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(TagResponse.from(tag), "태그가 생성되었습니다"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<TagResponse>> updateTag(
            @PathVariable String id, @Valid @RequestBody TagCommand command) {
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
    public ResponseEntity<ApiResponse<TagResponse>> findOrCreateTag(
            @Valid @RequestBody TagCommand command) {
        Tag tag = tagUseCase.findOrCreateByName(command.getName());
        return ResponseEntity.ok(ApiResponse.success(TagResponse.from(tag)));
    }
}
