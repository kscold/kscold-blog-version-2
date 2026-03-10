package com.kscold.blog.social.adapter.in.web;

import com.kscold.blog.shared.web.ApiResponse;
import com.kscold.blog.social.application.dto.LinkPreviewResponse;
import com.kscold.blog.social.application.port.in.LinkScrapingUseCase;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/link-preview")
@RequiredArgsConstructor
public class LinkScrapingController {

    private final LinkScrapingUseCase linkScrapingUseCase;

    @GetMapping
    public ResponseEntity<ApiResponse<LinkPreviewResponse>> getLinkPreview(
            @RequestParam String url
    ) {
        return ResponseEntity.ok(ApiResponse.success(linkScrapingUseCase.getLinkPreview(url)));
    }
}
