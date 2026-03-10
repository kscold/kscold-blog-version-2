package com.kscold.blog.blog.adapter.out.persistence;

import com.kscold.blog.blog.domain.model.Post;
import com.kscold.blog.blog.domain.port.out.PostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

/**
 * PostRepository 포트의 영속성 어댑터
 * Spring Data MongoDB를 사용하여 포트 인터페이스를 구현
 */
@SuppressWarnings("null")
@Component
@RequiredArgsConstructor
public class PostRepositoryAdapter implements PostRepository {

    private final MongoPostRepository mongoPostRepository;

    @Override
    public Post save(Post post) {
        return mongoPostRepository.save(post);
    }

    @Override
    public Optional<Post> findById(String id) {
        return mongoPostRepository.findById(id);
    }

    @Override
    public Optional<Post> findBySlug(String slug) {
        return mongoPostRepository.findBySlug(slug);
    }

    @Override
    public Page<Post> findByStatus(Post.Status status, Pageable pageable) {
        return mongoPostRepository.findByStatus(status, pageable);
    }

    @Override
    public Page<Post> findByCategoryIdAndPublished(String categoryId, Pageable pageable) {
        return mongoPostRepository.findByCategoryIdAndPublished(categoryId, pageable);
    }

    @Override
    public Page<Post> findByTagIdAndPublished(String tagId, Pageable pageable) {
        return mongoPostRepository.findByTagIdAndPublished(tagId, pageable);
    }

    @Override
    public List<Post> findFeaturedPosts(Pageable pageable) {
        return mongoPostRepository.findFeaturedPosts(pageable);
    }

    @Override
    public Page<Post> searchByText(String searchText, Pageable pageable) {
        return mongoPostRepository.searchByText(searchText, pageable);
    }

    @Override
    public Page<Post> findAll(Pageable pageable) {
        return mongoPostRepository.findAll(pageable);
    }

    @Override
    public boolean existsBySlug(String slug) {
        return mongoPostRepository.existsBySlug(slug);
    }

    @Override
    public long countByStatus(Post.Status status) {
        return mongoPostRepository.countByStatus(status);
    }
}
