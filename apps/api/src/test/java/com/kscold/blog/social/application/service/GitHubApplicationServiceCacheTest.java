package com.kscold.blog.social.application.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.reset;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.kscold.blog.exception.InvalidRequestException;
import com.kscold.blog.social.application.port.in.GitHubUseCase;
import com.kscold.blog.social.config.GitHubCacheConfiguration;
import com.kscold.blog.social.domain.port.out.GitHubPort;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.cache.CacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.test.context.junit.jupiter.SpringJUnitConfig;

@SpringJUnitConfig(
        classes = {
            GitHubCacheConfiguration.class,
            GitHubApplicationServiceCacheTest.TestConfiguration.class
        })
class GitHubApplicationServiceCacheTest {

    @Autowired private GitHubUseCase service;
    @Autowired private GitHubPort gitHubPort;

    @Autowired
    @Qualifier("githubCacheManager")
    private CacheManager cacheManager;

    @BeforeEach
    void resetCacheAndMock() {
        cacheManager.getCacheNames().forEach(name -> cacheManager.getCache(name).clear());
        reset(gitHubPort);
    }

    @Test
    void 같은사용자와연도의기여도는대소문자와무관하게한번만조회한다() {
        int year = LocalDate.now().getYear();
        when(gitHubPort.fetchContributionDays("kscold", year))
                .thenReturn(new GitHubPort.ContributionResult(List.of(), 321));

        var first = service.getContributions("KSCOLD", year);
        var second = service.getContributions("kscold", year);

        assertThat(first.getTotal()).isEqualTo(321);
        assertThat(second.getTotal()).isEqualTo(321);
        verify(gitHubPort).fetchContributionDays("kscold", year);
    }

    @Test
    void 잘못된사용자명과기여연도는외부호출전에거부한다() {
        assertThatThrownBy(() -> service.getOverview("invalid--name!"))
                .isInstanceOf(InvalidRequestException.class);
        assertThatThrownBy(() -> service.getContributions("kscold", LocalDate.now().getYear() + 1))
                .isInstanceOf(InvalidRequestException.class);
    }

    @Configuration(proxyBeanMethods = false)
    static class TestConfiguration {

        @Bean
        GitHubPort gitHubPort() {
            return mock(GitHubPort.class);
        }

        @Bean
        GitHubUseCase gitHubUseCase(GitHubPort gitHubPort) {
            return new GitHubApplicationService(gitHubPort);
        }
    }
}
