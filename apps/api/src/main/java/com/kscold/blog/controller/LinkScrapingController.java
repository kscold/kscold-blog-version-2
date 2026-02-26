package com.kscold.blog.controller;

import com.kscold.blog.dto.response.ApiResponse;
import com.kscold.blog.dto.response.LinkPreviewResponse;
import com.kscold.blog.service.LinkScrapingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/link-preview")
@RequiredArgsConstructor
public class LinkScrapingController {

    private final LinkScrapingService linkScrapingService;

    /**
     * URL의 OG 메타데이터 추출
     * GET /api/link-preview?url=https://...
     */
    @GetMapping
    public ResponseEntity<ApiResponse<LinkPreviewResponse>> getLinkPreview(
            @RequestParam String url
    ) {
        LinkPreviewResponse preview = linkScrapingService.scrape(url);
        return ResponseEntity.ok(ApiResponse.success(preview));
    }
}
