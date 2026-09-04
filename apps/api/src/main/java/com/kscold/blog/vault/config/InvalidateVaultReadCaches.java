package com.kscold.blog.vault.config;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import org.springframework.cache.annotation.CacheEvict;

/** 노트 변경 뒤 공개 Vault 읽기 모델 캐시를 함께 비운다. */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@CacheEvict(
        cacheManager = "vaultCacheManager",
        cacheNames = {
            VaultCacheConfiguration.GRAPH_CACHE,
            VaultCacheConfiguration.TITLE_INDEX_CACHE,
            VaultCacheConfiguration.SITEMAP_INDEX_CACHE,
            VaultCacheConfiguration.STATS_CACHE
        },
        allEntries = true)
public @interface InvalidateVaultReadCaches {}
