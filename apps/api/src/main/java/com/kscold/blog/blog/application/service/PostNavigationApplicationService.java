package com.kscold.blog.blog.application.service;

import com.kscold.blog.blog.application.port.in.PostNavigationUseCase;
import com.kscold.blog.blog.domain.model.PostNavigation;
import com.kscold.blog.blog.domain.port.out.PostNavigationRepository;
import com.kscold.blog.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PostNavigationApplicationService implements PostNavigationUseCase {
    private final PostNavigationRepository repository;

    @Override
    public PostNavigation getBySlug(String slug) {
        return repository.findBySlug(slug).orElseThrow(() -> ResourceNotFoundException.post(slug));
    }
}
