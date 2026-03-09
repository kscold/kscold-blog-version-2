package com.kscold.blog.blog.infrastructure.persistence;

import com.kscold.blog.blog.domain.model.Post;
import com.kscold.blog.blog.domain.port.out.PostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class MongoPostRepository implements PostRepository {

    private final SpringDataPostRepository delegate;

    @Override
    public Optional<Post> findById(String id) {
        return delegate.findById(id);
    }

    @Override
    public Optional<Post> findBySlug(String slug) {
        return delegate.findBySlug(slug);
    }

    @Override
    public boolean existsBySlug(String slug) {
        return delegate.existsBySlug(slug);
    }

    @Override
    public Post save(Post post) {
        return delegate.save(post);
    }

    @Override
    public Page<Post> findAll(Pageable pageable) {
        return delegate.findAll(pageable);
    }

    @Override
    public Page<Post> findByStatus(Post.Status status, Pageable pageable) {
        return delegate.findByStatus(status, pageable);
    }

    @Override
    public List<Post> findFeaturedPosts(Pageable pageable) {
        return delegate.findByFeaturedTrueAndStatus(Post.Status.PUBLISHED, pageable);
    }

    @Override
    public Page<Post> findByCategoryIdAndPublished(String categoryId, Pageable pageable) {
        return delegate.findByCategoryIdAndStatus(categoryId, Post.Status.PUBLISHED, pageable);
    }

    @Override
    public Page<Post> findByTagIdAndPublished(String tagId, Pageable pageable) {
        return delegate.findByTagIdAndStatus(tagId, Post.Status.PUBLISHED, pageable);
    }

    @Override
    public Page<Post> searchByText(String keyword, Pageable pageable) {
        return delegate.findByTitleContainingIgnoreCaseOrContentContainingIgnoreCase(keyword, keyword, pageable);
    }
}

interface SpringDataPostRepository extends MongoRepository<Post, String> {
    Optional<Post> findBySlug(String slug);
    boolean existsBySlug(String slug);
    Page<Post> findByStatus(Post.Status status, Pageable pageable);
    List<Post> findByFeaturedTrueAndStatus(Post.Status status, Pageable pageable);

    @Query("{ 'category.id': ?0, 'status': ?1 }")
    Page<Post> findByCategoryIdAndStatus(String categoryId, Post.Status status, Pageable pageable);

    @Query("{ 'tags.id': ?0, 'status': ?1 }")
    Page<Post> findByTagIdAndStatus(String tagId, Post.Status status, Pageable pageable);

    Page<Post> findByTitleContainingIgnoreCaseOrContentContainingIgnoreCase(
            String title, String content, Pageable pageable);
}
