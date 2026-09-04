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

    long count();

    Page<VaultNote> findByFolderId(String folderId, Pageable pageable);

    Page<VaultNote> searchByText(String query, Pageable pageable);

    List<VaultNote> findByOutgoingLinksContaining(String noteId);

    /** 백링크 카드에 필요한 식별자와 짧은 본문만 조회한다. */
    List<BacklinkNote> findBacklinkSummaries(String noteId);

    /** 그래프 렌더링에 필요한 필드와 본문 길이만 조회한다. 본문 원문을 애플리케이션으로 옮기지 않고 DB에서 길이를 계산해 응답 크기와 메모리 사용량을 줄인다. */
    List<GraphNote> findAllForGraph();

    /** 위키 링크 해석에 필요한 제목과 slug만 조회한다. */
    List<TitleNote> findAllForTitleIndex();

    /** 사이트맵 색인 판정에 필요한 slug와 본문 길이만 조회한다. */
    List<SitemapNote> findAllForSitemap();

    /** Vault 그래프 전용 읽기 모델 */
    record GraphNote(
            String id,
            String title,
            String slug,
            List<String> outgoingLinks,
            String folderId,
            int contentLength) {}

    /** Vault 위키 링크 전용 읽기 모델 */
    record TitleNote(String title, String slug) {}

    /** Vault 사이트맵 전용 읽기 모델 */
    record SitemapNote(String slug, int contentLength) {}

    /** Vault 백링크 카드 전용 읽기 모델 */
    record BacklinkNote(String id, String title, String slug, String excerpt) {}

    void incrementCommentCount(String noteId);

    void decrementCommentCount(String noteId);
}
