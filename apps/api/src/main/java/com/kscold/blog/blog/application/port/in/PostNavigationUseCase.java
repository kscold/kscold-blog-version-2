package com.kscold.blog.blog.application.port.in;

import com.kscold.blog.blog.domain.model.PostNavigation;

public interface PostNavigationUseCase {
    PostNavigation getBySlug(String slug);
}
