package com.kscold.blog.blog.domain.port.out;

import com.kscold.blog.blog.domain.model.PostNavigation;
import java.util.Optional;

public interface PostNavigationRepository {
    Optional<PostNavigation> findBySlug(String slug);
}
