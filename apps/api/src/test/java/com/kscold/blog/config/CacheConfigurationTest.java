package com.kscold.blog.config;

import static org.assertj.core.api.Assertions.assertThat;

import com.kscold.blog.social.config.GitHubCacheConfiguration;
import com.kscold.blog.vault.config.VaultCacheConfiguration;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.cache.CacheManager;
import org.springframework.test.context.junit.jupiter.SpringJUnitConfig;

@SpringJUnitConfig(classes = {GitHubCacheConfiguration.class, VaultCacheConfiguration.class})
class CacheConfigurationTest {

    @Autowired private CacheManager defaultCacheManager;

    @Autowired
    @Qualifier("githubCacheManager")
    private CacheManager githubCacheManager;

    @Autowired
    @Qualifier("vaultCacheManager")
    private CacheManager vaultCacheManager;

    @Test
    void 캐시매니저가여러개여도기본구성을결정한다() {
        assertThat(defaultCacheManager).isSameAs(githubCacheManager);
        assertThat(vaultCacheManager).isNotSameAs(githubCacheManager);
    }
}
