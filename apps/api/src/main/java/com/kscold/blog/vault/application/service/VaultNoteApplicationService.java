package com.kscold.blog.vault.application.service;

import com.kscold.blog.dto.response.GraphDataResponse;
import com.kscold.blog.exception.DuplicateResourceException;
import com.kscold.blog.exception.ResourceNotFoundException;
import com.kscold.blog.identity.application.port.in.UserQueryPort;
import com.kscold.blog.util.SlugUtils;
import com.kscold.blog.vault.application.dto.NoteCreateCommand;
import com.kscold.blog.vault.application.dto.NoteUpdateCommand;
import com.kscold.blog.vault.domain.model.VaultNote;
import com.kscold.blog.vault.domain.port.out.VaultFolderRepository;
import com.kscold.blog.vault.domain.port.out.VaultNoteCommentRepository;
import com.kscold.blog.vault.domain.port.out.VaultNoteRepository;
import com.kscold.blog.vault.domain.service.BacklinkParsingService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class VaultNoteApplicationService {

    private final VaultNoteRepository vaultNoteRepository;
    private final VaultNoteCommentRepository vaultNoteCommentRepository;
    private final VaultFolderRepository vaultFolderRepository;
    private final VaultFolderApplicationService vaultFolderApplicationService;
    private final UserQueryPort userQueryPort;
    private final BacklinkParsingService backlinkParsingService;
    private final MongoTemplate mongoTemplate;

    @Transactional
    public VaultNote create(NoteCreateCommand command, String userId) {
        // 폴더 존재 검증
        if (command.getFolderId() != null) {
            vaultFolderRepository.findById(command.getFolderId())
                    .orElseThrow(() -> ResourceNotFoundException.vaultFolder(command.getFolderId()));
        }

        String slug = command.getSlug() != null ? command.getSlug() : SlugUtils.generate(command.getTitle());
        if (vaultNoteRepository.existsBySlug(slug)) {
            throw DuplicateResourceException.slug(slug);
        }

        UserQueryPort.UserInfo author = userQueryPort.getUserById(userId);

        List<String> outgoingLinks = backlinkParsingService.parseBacklinks(command.getContent());

        VaultNote note = VaultNote.builder()
                .title(command.getTitle())
                .slug(slug)
                .content(command.getContent())
                .folderId(command.getFolderId())
                .author(VaultNote.AuthorInfo.builder()
                        .id(author.id())
                        .name(author.displayName())
                        .build())
                .outgoingLinks(outgoingLinks)
                .tags(command.getTags() != null ? command.getTags() : new ArrayList<>())
                .build();

        VaultNote saved = vaultNoteRepository.save(note);
        vaultFolderApplicationService.incrementNoteCount(command.getFolderId());
        return saved;
    }

    @Transactional
    public VaultNote update(String id, NoteUpdateCommand command) {
        VaultNote note = findById(id);

        if (command.getTitle() != null) {
            note.setTitle(command.getTitle());
        }
        if (command.getSlug() != null && !command.getSlug().equals(note.getSlug())) {
            if (vaultNoteRepository.existsBySlug(command.getSlug())) {
                throw DuplicateResourceException.slug(command.getSlug());
            }
            note.setSlug(command.getSlug());
        }
        if (command.getContent() != null) {
            note.setContent(command.getContent());
            note.setOutgoingLinks(backlinkParsingService.parseBacklinks(command.getContent()));
        }
        if (command.getFolderId() != null && !command.getFolderId().equals(note.getFolderId())) {
            vaultFolderApplicationService.decrementNoteCount(note.getFolderId());
            vaultFolderApplicationService.incrementNoteCount(command.getFolderId());
            note.setFolderId(command.getFolderId());
        }
        if (command.getTags() != null) {
            note.setTags(command.getTags());
        }

        return vaultNoteRepository.save(note);
    }

    @Transactional
    public void delete(String id) {
        VaultNote note = findById(id);
        vaultNoteCommentRepository.deleteAllByNoteId(id);
        vaultFolderApplicationService.decrementNoteCount(note.getFolderId());
        vaultNoteRepository.delete(note);
    }

    private VaultNote findById(String id) {
        return vaultNoteRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.vaultNote(id));
    }

    @Transactional
    public VaultNote getById(String id) {
        VaultNote note = findById(id);
        note.setViews(note.getViews() + 1);
        return vaultNoteRepository.save(note);
    }

    public VaultNote getBySlug(String slug) {
        return vaultNoteRepository.findBySlug(slug)
                .orElseThrow(() -> ResourceNotFoundException.vaultNote(slug));
    }

    @Transactional
    public VaultNote getBySlugWithView(String slug) {
        VaultNote note = getBySlug(slug);
        note.setViews(note.getViews() + 1);
        return vaultNoteRepository.save(note);
    }

    public Page<VaultNote> getAll(Pageable pageable) {
        return vaultNoteRepository.findAll(pageable);
    }

    public Page<VaultNote> getByFolder(String folderId, Pageable pageable) {
        return vaultNoteRepository.findByFolderId(folderId, pageable);
    }

    public Page<VaultNote> search(String query, Pageable pageable) {
        return vaultNoteRepository.searchByText(query, pageable);
    }

    /**
     * 이 노트를 참조하는 다른 노트 목록 (백링크/역방향 참조)
     */
    public List<VaultNote> getBackreferences(String noteId) {
        return vaultNoteRepository.findByOutgoingLinksContaining(noteId);
    }

    /**
     * 전체 노트의 그래프 데이터 (노드 + 링크)
     * Projection 쿼리로 필요한 필드만 조회하여 메모리 최적화
     */
    public GraphDataResponse getGraphData() {
        Query query = new Query();
        query.fields().include("id", "title", "slug", "outgoingLinks", "folderId");
        List<VaultNote> allNotes = mongoTemplate.find(query, VaultNote.class);

        List<GraphDataResponse.GraphNode> nodes = allNotes.stream()
                .map(note -> {
                    int size = note.getOutgoingLinks() != null ? note.getOutgoingLinks().size() + 1 : 1;
                    return GraphDataResponse.GraphNode.builder()
                            .id(note.getId())
                            .name(note.getTitle())
                            .slug(note.getSlug())
                            .size(size)
                            .folderId(note.getFolderId())
                            .build();
                })
                .toList();

        List<GraphDataResponse.GraphLink> links = new ArrayList<>();
        for (VaultNote note : allNotes) {
            if (note.getOutgoingLinks() != null) {
                for (String targetId : note.getOutgoingLinks()) {
                    links.add(GraphDataResponse.GraphLink.builder()
                            .source(note.getId())
                            .target(targetId)
                            .build());
                }
            }
        }

        return GraphDataResponse.builder()
                .nodes(nodes)
                .links(links)
                .build();
    }

    /**
     * 댓글 수 원자적 증가
     */
    public void incrementCommentCount(String noteId) {
        mongoTemplate.updateFirst(
                Query.query(Criteria.where("id").is(noteId)),
                new Update().inc("commentsCount", 1),
                VaultNote.class
        );
    }

    /**
     * 댓글 수 원자적 감소 (최소 0)
     */
    public void decrementCommentCount(String noteId) {
        mongoTemplate.updateFirst(
                Query.query(Criteria.where("id").is(noteId).and("commentsCount").gt(0)),
                new Update().inc("commentsCount", -1),
                VaultNote.class
        );
    }
}
