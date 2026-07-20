package com.kscold.blog.vault.domain.port.out;

import com.kscold.blog.vault.domain.model.VaultNote;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface VaultNoteRepository {
    Optional<VaultNote> findById(String id);

    Optional<VaultNote> findBySlug(String slug);

    boolean existsBySlug(String slug);

    VaultNote save(VaultNote note);

    void delete(VaultNote note);

    Page<VaultNote> findAll(Pageable pageable);

    List<VaultNote> findAll();

    Page<VaultNote> findByFolderId(String folderId, Pageable pageable);

    Page<VaultNote> searchByText(String query, Pageable pageable);

    List<VaultNote> findByOutgoingLinksContaining(String noteId);

    List<VaultNote> findAllForGraph();

    /**
     * 노트별 본문 글자 수만 조회함. 본문 자체는 전송하지 않고 DB에서 길이만 계산하므로, 전체 노트를 훑어도 응답이 가볍다. 사이트맵이 분량 미달 노트를 색인 대상에서
     * 제외하는 데 사용함.
     */
    List<NoteContentLength> findAllContentLengths();

    /** 노트 id 와 본문 글자 수 */
    record NoteContentLength(String id, int contentLength) {}

    void incrementCommentCount(String noteId);

    void decrementCommentCount(String noteId);
}
