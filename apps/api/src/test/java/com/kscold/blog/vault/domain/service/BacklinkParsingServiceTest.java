package com.kscold.blog.vault.domain.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import com.kscold.blog.vault.domain.model.VaultNote;
import com.kscold.blog.vault.domain.port.out.VaultNoteRepository;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class BacklinkParsingServiceTest {

    @Mock private VaultNoteRepository vaultNoteRepository;

    private BacklinkParsingService backlinkParsingService;

    @BeforeEach
    void setUp() {
        backlinkParsingService = new BacklinkParsingService(vaultNoteRepository);
    }

    @Test
    @DisplayName("[[title|alias]]와 [[title#anchor]]를 대상 노트 ID로 파싱한다")
    void parseBacklinksWithAliasAndAnchor() {
        when(vaultNoteRepository.findBySlug("ai-agent"))
                .thenReturn(Optional.of(note("note-ai-agent")));
        when(vaultNoteRepository.findBySlug("memory")).thenReturn(Optional.of(note("note-memory")));
        when(vaultNoteRepository.findBySlug("missing-note")).thenReturn(Optional.empty());

        var links =
                backlinkParsingService.parseBacklinks(
                        """
                [[AI Agent|에이전트]]
                [[Memory#핵심 개념]]
                [[AI Agent]]
                [[Missing Note]]
                """);

        assertThat(links).containsExactly("note-ai-agent", "note-memory");
    }

    private VaultNote note(String id) {
        return VaultNote.builder().id(id).build();
    }
}
