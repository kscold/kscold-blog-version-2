package com.kscold.blog.blog.application.port.in;

import com.kscold.blog.blog.application.dto.PostCreateCommand;
import com.kscold.blog.blog.application.dto.PostUpdateCommand;
import com.kscold.blog.blog.domain.model.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface PostUseCase {

    Post create(PostCreateCommand command, String userId);

    Post update(String id, PostUpdateCommand command);

    void delete(String id);

    Post getById(String id);

    Post getBySlug(String slug);

    Page<Post> getAll(Pageable pageable);

    Page<Post> getAllAdmin(Pageable pageable);

    List<Post> getFeatured(Pageable pageable);

    Page<Post> getByCategory(String categoryId, Pageable pageable);

    Page<Post> getByTag(String tagId, Pageable pageable);

    Page<Post> search(String keyword, Pageable pageable);

    boolean existsBySlug(String slug);
}
