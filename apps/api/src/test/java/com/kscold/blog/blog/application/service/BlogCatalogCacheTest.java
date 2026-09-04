package com.kscold.blog.blog.application.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.reset;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.kscold.blog.blog.application.dto.command.CategoryCreateCommand;
import com.kscold.blog.blog.application.port.in.CategoryUseCase;
import com.kscold.blog.blog.application.port.in.TagCatalogUseCase;
import com.kscold.blog.blog.config.BlogCatalogCacheConfiguration;
import com.kscold.blog.blog.domain.model.Category;
import com.kscold.blog.blog.domain.model.Tag;
import com.kscold.blog.blog.domain.port.out.CategoryRepository;
import com.kscold.blog.blog.domain.port.out.PostRepository;
import com.kscold.blog.blog.domain.port.out.TagRepository;
import com.kscold.blog.social.application.port.in.FeedUseCase;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.test.context.junit.jupiter.SpringJUnitConfig;

@SpringJUnitConfig(
        classes = {
            BlogCatalogCacheConfiguration.class,
            BlogCatalogCacheTest.TestConfiguration.class
        })
class BlogCatalogCacheTest {

    @Autowired private CategoryUseCase categoryUseCase;
    @Autowired private TagCatalogUseCase tagCatalogUseCase;
    @Autowired private CategoryRepository categoryRepository;
    @Autowired private TagRepository tagRepository;
    @Autowired private PostRepository postRepository;
    @Autowired private FeedUseCase feedUseCase;

    @Autowired
    @Qualifier("blogCatalogCacheManager")
    private CacheManager cacheManager;

    @BeforeEach
    void resetCacheAndMocks() {
        cacheManager.getCacheNames().forEach(name -> cacheManager.getCache(name).clear());
        reset(categoryRepository, tagRepository, postRepository, feedUseCase);
    }

    @Test
    void cachesCatalogReadsAndEvictsBothAfterCategoryChange() {
        Category category = Category.builder().id("category-1").name("AI").slug("ai").build();
        Tag tag = Tag.builder().id("tag-1").name("LangGraph").slug("langgraph").build();
        when(categoryRepository.findAll()).thenReturn(List.of(category));
        when(tagRepository.findAll()).thenReturn(List.of(tag));
        when(postRepository.countPublishedByTagName()).thenReturn(Map.of("LangGraph", 3L));
        when(feedUseCase.getFeedTagCounts()).thenReturn(Map.of("LangGraph", 2L));

        assertThat(categoryUseCase.getAll()).isSameAs(categoryUseCase.getAll());
        assertThat(tagCatalogUseCase.getIndex()).isSameAs(tagCatalogUseCase.getIndex());
        verify(categoryRepository, org.mockito.Mockito.times(2)).findAll();
        verify(tagRepository).findAll();
        verify(postRepository).countPublishedByTagName();
        verify(feedUseCase).getFeedTagCounts();

        Cache categoryCache =
                cacheManager.getCache(BlogCatalogCacheConfiguration.CATEGORY_INDEX_CACHE);
        Cache tagCache = cacheManager.getCache(BlogCatalogCacheConfiguration.TAG_INDEX_CACHE);
        assertThat(categoryCache.get(org.springframework.cache.interceptor.SimpleKey.EMPTY))
                .isNotNull();
        assertThat(tagCache.get(org.springframework.cache.interceptor.SimpleKey.EMPTY)).isNotNull();

        categoryUseCase.create(CategoryCreateCommand.builder().name("새 분류").build());

        assertThat(categoryCache.get(org.springframework.cache.interceptor.SimpleKey.EMPTY))
                .isNull();
        assertThat(tagCache.get(org.springframework.cache.interceptor.SimpleKey.EMPTY)).isNull();
    }

    @Configuration(proxyBeanMethods = false)
    @EnableCaching
    static class TestConfiguration {

        @Bean
        CategoryRepository categoryRepository() {
            return mock(CategoryRepository.class);
        }

        @Bean
        TagRepository tagRepository() {
            return mock(TagRepository.class);
        }

        @Bean
        PostRepository postRepository() {
            return mock(PostRepository.class);
        }

        @Bean
        FeedUseCase feedUseCase() {
            return mock(FeedUseCase.class);
        }

        @Bean
        CategoryUseCase categoryUseCase(CategoryRepository categoryRepository) {
            return new CategoryApplicationService(categoryRepository);
        }

        @Bean
        TagCatalogUseCase tagCatalogUseCase(
                TagRepository tagRepository,
                PostRepository postRepository,
                CategoryRepository categoryRepository,
                FeedUseCase feedUseCase) {
            return new TagCatalogApplicationService(
                    tagRepository, postRepository, categoryRepository, feedUseCase);
        }
    }
}
