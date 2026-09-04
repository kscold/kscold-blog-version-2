package com.kscold.blog.vault.application.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.reset;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.kscold.blog.identity.application.port.in.UserQueryPort;
import com.kscold.blog.vault.application.dto.command.NoteUpdateCommand;
import com.kscold.blog.vault.application.port.in.VaultNoteUseCase;
import com.kscold.blog.vault.config.VaultCacheConfiguration;
import com.kscold.blog.vault.domain.model.VaultNote;
import com.kscold.blog.vault.domain.port.out.VaultFolderRepository;
import com.kscold.blog.vault.domain.port.out.VaultNoteCommentRepository;
import com.kscold.blog.vault.domain.port.out.VaultNoteRepository;
import com.kscold.blog.vault.domain.service.BacklinkParsingService;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.test.context.junit.jupiter.SpringJUnitConfig;

@SpringJUnitConfig(
        classes = {
            VaultCacheConfiguration.class,
            VaultNoteApplicationServiceCacheTest.TestConfiguration.class
        })
class VaultNoteApplicationServiceCacheTest {

    @Autowired private VaultNoteUseCase service;
    @Autowired private VaultNoteRepository vaultNoteRepository;

    @Autowired
    @Qualifier("vaultCacheManager")
    private CacheManager cacheManager;

    @BeforeEach
    void resetCacheAndMock() {
        cacheManager.getCacheNames().forEach(name -> cacheManager.getCache(name).clear());
        reset(vaultNoteRepository);
    }

    @Test
    void 전체그래프는한번만조회하고노트수정후다시계산한다() {
        var graphNote =
                new VaultNoteRepository.GraphNote(
                        "note-1", "제목", "title", List.of(), "folder-1", 100);
        VaultNote note =
                VaultNote.builder()
                        .id("note-1")
                        .title("제목")
                        .slug("title")
                        .folderId("folder-1")
                        .build();
        when(vaultNoteRepository.findAllForGraph()).thenReturn(List.of(graphNote));
        when(vaultNoteRepository.findById("note-1")).thenReturn(Optional.of(note));
        when(vaultNoteRepository.save(note)).thenReturn(note);

        var first = service.getGraphData();
        var second = service.getGraphData();

        assertThat(first).isSameAs(second);
        verify(vaultNoteRepository).findAllForGraph();

        service.update("note-1", NoteUpdateCommand.builder().title("새 제목").build());
        service.getGraphData();

        verify(vaultNoteRepository, org.mockito.Mockito.times(2)).findAllForGraph();
    }

    @Configuration(proxyBeanMethods = false)
    @EnableCaching
    static class TestConfiguration {

        @Bean
        VaultNoteRepository vaultNoteRepository() {
            return mock(VaultNoteRepository.class);
        }

        @Bean
        VaultNoteCommentRepository vaultNoteCommentRepository() {
            return mock(VaultNoteCommentRepository.class);
        }

        @Bean
        VaultFolderRepository vaultFolderRepository() {
            return mock(VaultFolderRepository.class);
        }

        @Bean
        UserQueryPort userQueryPort() {
            return mock(UserQueryPort.class);
        }

        @Bean
        BacklinkParsingService backlinkParsingService() {
            return mock(BacklinkParsingService.class);
        }

        @Bean
        VaultNoteUseCase vaultNoteUseCase(
                VaultNoteRepository vaultNoteRepository,
                VaultNoteCommentRepository vaultNoteCommentRepository,
                VaultFolderRepository vaultFolderRepository,
                UserQueryPort userQueryPort,
                BacklinkParsingService backlinkParsingService) {
            return new VaultNoteApplicationService(
                    vaultNoteRepository,
                    vaultNoteCommentRepository,
                    vaultFolderRepository,
                    userQueryPort,
                    backlinkParsingService);
        }
    }
}
