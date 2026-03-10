package com.kscold.blog.social.domain.port.out;

import com.kscold.blog.social.application.dto.LinkPreviewResponse;

public interface LinkScrapingPort {
    LinkPreviewResponse scrape(String url);
}
