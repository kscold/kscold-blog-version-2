package com.kscold.blog.blog.adapter.in.web;

import com.kscold.blog.blog.adapter.in.web.dto.response.PostNavigationResponse;
import com.kscold.blog.blog.application.port.in.PostNavigationUseCase;
import com.kscold.blog.shared.web.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/posts/slug/{slug}/navigation")
@RequiredArgsConstructor
public class PostNavigationController {
    private final PostNavigationUseCase useCase;

    @GetMapping
    public ApiResponse<PostNavigationResponse> getNavigation(@PathVariable String slug) {
        return ApiResponse.success(PostNavigationResponse.from(useCase.getBySlug(slug)));
    }
}
