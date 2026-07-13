package com.kscold.blog.social.application.port.in;

import com.kscold.blog.social.domain.model.LinkPreviewResponse;

public interface LinkScrapingUseCase {
    LinkPreviewResponse getLinkPreview(String url);
}
