package com.kscold.blog.social.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import java.time.Duration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration(proxyBeanMethods = false)
@EnableCaching
public class GitHubCacheConfiguration {

    @Bean("githubCacheManager")
    public CacheManager githubCacheManager(
            @Value("${github.cache.ttl-minutes:30}") long ttlMinutes,
            @Value("${github.cache.max-size:200}") long maxSize) {
        CaffeineCacheManager cacheManager =
                new CaffeineCacheManager("githubOverview", "githubContributions");
        cacheManager.setAllowNullValues(false);
        cacheManager.setCaffeine(
                Caffeine.newBuilder()
                        .expireAfterWrite(Duration.ofMinutes(Math.max(ttlMinutes, 1)))
                        .maximumSize(Math.max(maxSize, 1)));
        return cacheManager;
    }
}
