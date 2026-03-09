package com.kscold.blog.social.adapter.in.web;

import com.kscold.blog.shared.web.ApiResponse;
import com.kscold.blog.social.domain.dto.LinkPreviewResponse;
import com.kscold.blog.social.domain.port.out.LinkScrapingPort;
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

    private final LinkScrapingPort linkScrapingPort;

    /**
     * URL의 OG 메타데이터 추출
     * GET /api/link-preview?url=https://...
     */
    @GetMapping
    public ResponseEntity<ApiResponse<LinkPreviewResponse>> getLinkPreview(
            @RequestParam String url
    ) {
        LinkPreviewResponse preview = linkScrapingPort.scrape(url);
        return ResponseEntity.ok(ApiResponse.success(preview));
    }
}
