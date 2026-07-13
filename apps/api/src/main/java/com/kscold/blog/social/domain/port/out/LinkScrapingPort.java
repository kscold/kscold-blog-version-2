package com.kscold.blog.social.domain.port.out;

import com.kscold.blog.social.domain.model.LinkPreviewResponse;

public interface LinkScrapingPort {
    LinkPreviewResponse scrape(String url);
}
