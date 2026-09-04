package com.kscold.blog.blog.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import java.time.Duration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.CacheManager;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration(proxyBeanMethods = false)
public class BlogCatalogCacheConfiguration {

    public static final String CATEGORY_INDEX_CACHE = "blogCategoryIndex";
    public static final String TAG_INDEX_CACHE = "blogTagIndex";

    @Bean("blogCatalogCacheManager")
    public CacheManager blogCatalogCacheManager(
            @Value("${blog.catalog-cache.ttl-minutes:5}") long ttlMinutes) {
        CaffeineCacheManager cacheManager =
                new CaffeineCacheManager(CATEGORY_INDEX_CACHE, TAG_INDEX_CACHE);
        cacheManager.setAllowNullValues(false);
        cacheManager.setCaffeine(
                Caffeine.newBuilder()
                        .expireAfterWrite(Duration.ofMinutes(Math.max(ttlMinutes, 1)))
                        .maximumSize(8));
        return cacheManager;
    }
}
