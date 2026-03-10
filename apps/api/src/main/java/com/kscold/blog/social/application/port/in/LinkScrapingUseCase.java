package com.kscold.blog.social.application.port.in;

import com.kscold.blog.social.application.dto.LinkPreviewResponse;

public interface LinkScrapingUseCase {
    LinkPreviewResponse getLinkPreview(String url);
}
