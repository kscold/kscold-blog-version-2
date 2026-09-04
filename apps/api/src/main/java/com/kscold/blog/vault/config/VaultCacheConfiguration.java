package com.kscold.blog.vault.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import java.time.Duration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.CacheManager;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration(proxyBeanMethods = false)
public class VaultCacheConfiguration {

    public static final String GRAPH_CACHE = "vaultGraph";
    public static final String TITLE_INDEX_CACHE = "vaultTitleIndex";
    public static final String SITEMAP_INDEX_CACHE = "vaultSitemapIndex";
    public static final String STATS_CACHE = "vaultStats";

    @Bean("vaultCacheManager")
    public CacheManager vaultCacheManager(@Value("${vault.cache.ttl-minutes:5}") long ttlMinutes) {
        CaffeineCacheManager cacheManager =
                new CaffeineCacheManager(
                        GRAPH_CACHE, TITLE_INDEX_CACHE, SITEMAP_INDEX_CACHE, STATS_CACHE);
        cacheManager.setAllowNullValues(false);
        cacheManager.setCaffeine(
                Caffeine.newBuilder()
                        .expireAfterWrite(Duration.ofMinutes(Math.max(ttlMinutes, 1)))
                        .maximumSize(8));
        return cacheManager;
    }
}
