package com.kscold.blog.social.application.service;

import com.kscold.blog.social.application.dto.LinkPreviewResponse;
import com.kscold.blog.social.application.port.in.LinkScrapingUseCase;
import com.kscold.blog.social.domain.port.out.LinkScrapingPort;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class LinkApplicationService implements LinkScrapingUseCase {

    private final LinkScrapingPort linkScrapingPort;

    @Override
    public LinkPreviewResponse getLinkPreview(String url) {
        return linkScrapingPort.scrape(url);
    }
}
