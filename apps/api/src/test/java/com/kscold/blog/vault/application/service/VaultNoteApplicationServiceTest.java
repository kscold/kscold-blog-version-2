package com.kscold.blog.vault.application.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import com.kscold.blog.identity.application.port.in.UserQueryPort;
import com.kscold.blog.vault.application.dto.response.GraphDataResponse;
import com.kscold.blog.vault.domain.port.out.VaultFolderRepository;
import com.kscold.blog.vault.domain.port.out.VaultNoteCommentRepository;
import com.kscold.blog.vault.domain.port.out.VaultNoteRepository;
import com.kscold.blog.vault.domain.service.BacklinkParsingService;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class VaultNoteApplicationServiceTest {

    @Mock private VaultNoteRepository vaultNoteRepository;
    @Mock private VaultNoteCommentRepository vaultNoteCommentRepository;
    @Mock private VaultFolderRepository vaultFolderRepository;
    @Mock private UserQueryPort userQueryPort;
    @Mock private BacklinkParsingService backlinkParsingService;

    @InjectMocks private VaultNoteApplicationService service;

    @Test
    void 그래프전용조회결과로노드와링크를만든다() {
        when(vaultNoteRepository.findAllForGraph())
                .thenReturn(
                        List.of(
                                new VaultNoteRepository.GraphNote(
                                        "note-1",
                                        "첫 노트",
                                        "first-note",
                                        List.of("note-2"),
                                        "folder-1",
                                        120),
                                new VaultNoteRepository.GraphNote(
                                        "note-2",
                                        "둘째 노트",
                                        "second-note",
                                        List.of(),
                                        "folder-1",
                                        80)));

        GraphDataResponse response = service.getGraphData();

        assertThat(response.getNodes()).hasSize(2);
        assertThat(response.getNodes().getFirst().getSize()).isEqualTo(2);
        assertThat(response.getNodes().getFirst().getContentLength()).isEqualTo(120);
        assertThat(response.getLinks()).hasSize(1);
        assertThat(response.getLinks().getFirst().getSource()).isEqualTo("note-1");
        assertThat(response.getLinks().getFirst().getTarget()).isEqualTo("note-2");
    }
}
