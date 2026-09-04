package com.kscold.blog.blog.config;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import org.springframework.cache.annotation.CacheEvict;

/** 공개 카테고리·태그 읽기 모델에 영향을 주는 변경 뒤 두 캐시를 함께 비운다. */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@CacheEvict(
        cacheManager = "blogCatalogCacheManager",
        cacheNames = {
            BlogCatalogCacheConfiguration.CATEGORY_INDEX_CACHE,
            BlogCatalogCacheConfiguration.TAG_INDEX_CACHE
        },
        allEntries = true)
public @interface InvalidateBlogCatalogCaches {}
