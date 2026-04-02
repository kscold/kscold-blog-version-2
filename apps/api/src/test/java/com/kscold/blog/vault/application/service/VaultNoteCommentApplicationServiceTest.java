package com.kscold.blog.vault.application.service;

import com.kscold.blog.exception.InvalidRequestException;
import com.kscold.blog.identity.domain.model.User;
import com.kscold.blog.identity.domain.port.out.UserRepository;
import com.kscold.blog.support.UserFixtures;
import com.kscold.blog.vault.application.dto.NoteCommentCreateCommand;
import com.kscold.blog.vault.domain.model.VaultNoteComment;
import com.kscold.blog.vault.domain.port.out.VaultNoteCommentRepository;
import com.kscold.blog.vault.domain.port.out.VaultNoteRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class VaultNoteCommentApplicationServiceTest {

    @Mock
    private VaultNoteCommentRepository commentRepository;

    @Mock
    private VaultNoteRepository vaultNoteRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private VaultNoteCommentApplicationService vaultNoteCommentApplicationService;

    @Test
    @DisplayName("시나리오: 로그인 사용자가 Vault 댓글을 작성하면 같은 이름의 익명 댓글이 계정에 귀속된다")
    void createClaimsAnonymousCommentsAndSavesNewComment() {
        User user = UserFixtures.user("user-1", User.Role.USER, "kscold", "김승찬");
        VaultNoteComment legacyComment = VaultNoteComment.builder()
                .id("legacy-1")
                .noteId("note-1")
                .authorName("kscold")
                .authorPassword("secret")
                .content("예전 익명 댓글")
                .build();
        when(userRepository.findById("user-1")).thenReturn(Optional.of(user));
        when(commentRepository.findAnonymousByNoteIdAndAuthorNames(eq("note-1"), anyList()))
                .thenReturn(List.of(legacyComment));
        when(commentRepository.saveAll(anyList())).thenAnswer(invocation -> invocation.getArgument(0));
        when(commentRepository.save(any(VaultNoteComment.class))).thenAnswer(invocation -> invocation.getArgument(0));

        VaultNoteComment saved = vaultNoteCommentApplicationService.create(
                "note-1",
                new NoteCommentCreateCommand(null, null, "새 댓글"),
                "user-1"
        );

        ArgumentCaptor<List<VaultNoteComment>> claimedCaptor = ArgumentCaptor.forClass(List.class);
        verify(commentRepository).saveAll(claimedCaptor.capture());
        VaultNoteComment claimed = claimedCaptor.getValue().get(0);
        assertThat(claimed.getUserId()).isEqualTo("user-1");
        assertThat(claimed.getAuthorName()).isEqualTo("김승찬");
        assertThat(claimed.getAuthorRole()).isEqualTo(User.Role.USER);
        assertThat(claimed.getAuthorPassword()).isNull();

        assertThat(saved.getNoteId()).isEqualTo("note-1");
        assertThat(saved.getAuthorName()).isEqualTo("김승찬");
        assertThat(saved.getUserId()).isEqualTo("user-1");
        assertThat(saved.getContent()).isEqualTo("새 댓글");
        verify(vaultNoteRepository).incrementCommentCount("note-1");
    }

    @Test
    @DisplayName("시나리오: 로그인 사용자가 Vault 댓글 목록을 조회하면 예전 익명 댓글 귀속이 먼저 수행된다")
    void getByNoteIdClaimsAnonymousCommentsBeforeReturningPage() {
        User user = UserFixtures.user("user-1", User.Role.USER, "kscold", "김승찬");
        VaultNoteComment legacyComment = VaultNoteComment.builder()
                .id("legacy-1")
                .noteId("note-1")
                .authorName("kscold")
                .content("예전 익명 댓글")
                .build();
        when(userRepository.findById("user-1")).thenReturn(Optional.of(user));
        when(commentRepository.findAnonymousByNoteIdAndAuthorNames(eq("note-1"), anyList()))
                .thenReturn(List.of(legacyComment));
        when(commentRepository.saveAll(anyList())).thenAnswer(invocation -> invocation.getArgument(0));
        when(commentRepository.findByNoteId(eq("note-1"), any()))
                .thenReturn(new PageImpl<>(List.of(legacyComment)));

        var page = vaultNoteCommentApplicationService.getByNoteId("note-1", PageRequest.of(0, 20), "user-1");

        assertThat(page.getContent()).hasSize(1);
        var inOrder = inOrder(commentRepository);
        inOrder.verify(commentRepository).findAnonymousByNoteIdAndAuthorNames(eq("note-1"), anyList());
        inOrder.verify(commentRepository).saveAll(anyList());
        inOrder.verify(commentRepository).findByNoteId(eq("note-1"), any());
    }

    @Test
    @DisplayName("시나리오: 작성자도 관리자도 아닌 사용자는 다른 사람의 Vault 댓글을 삭제할 수 없다")
    void deleteRejectsNonOwner() {
        User user = UserFixtures.user("user-1", User.Role.USER, "kscold", "김승찬");
        VaultNoteComment comment = VaultNoteComment.builder()
                .id("comment-1")
                .noteId("note-1")
                .userId("user-2")
                .authorName("다른 사람")
                .content("댓글")
                .build();
        when(userRepository.findById("user-1")).thenReturn(Optional.of(user));
        when(commentRepository.findAnonymousByNoteIdAndAuthorNames(eq("note-1"), anyList()))
                .thenReturn(List.of());
        when(commentRepository.findById("comment-1")).thenReturn(Optional.of(comment));

        assertThatThrownBy(() -> vaultNoteCommentApplicationService.delete("note-1", "comment-1", "user-1"))
                .isInstanceOf(InvalidRequestException.class)
                .hasMessageContaining("본인이 작성한 댓글만 삭제할 수 있습니다");

        verify(commentRepository, never()).delete(any());
    }
}
