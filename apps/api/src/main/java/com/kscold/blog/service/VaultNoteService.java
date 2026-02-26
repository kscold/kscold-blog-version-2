package com.kscold.blog.service;

import com.kscold.blog.dto.request.VaultNoteCreateRequest;
import com.kscold.blog.dto.request.VaultNoteUpdateRequest;
import com.kscold.blog.dto.response.GraphDataResponse;
import com.kscold.blog.exception.DuplicateResourceException;
import com.kscold.blog.exception.ResourceNotFoundException;
import com.kscold.blog.model.User;
import com.kscold.blog.model.VaultNote;
import com.kscold.blog.repository.UserRepository;
import com.kscold.blog.repository.VaultNoteCommentRepository;
import com.kscold.blog.repository.VaultNoteRepository;
import com.kscold.blog.util.SlugUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class VaultNoteService {

    private final VaultNoteRepository vaultNoteRepository;
    private final VaultNoteCommentRepository vaultNoteCommentRepository;
    private final VaultFolderService vaultFolderService;
    private final UserRepository userRepository;

    private static final Pattern BACKLINK_PATTERN = Pattern.compile("\\[\\[([^\\]]+)\\]\\]");

    @Transactional
    public VaultNote create(VaultNoteCreateRequest request, String userId) {
        String slug = request.getSlug() != null ? request.getSlug() : SlugUtils.generate(request.getTitle());
        if (vaultNoteRepository.existsBySlug(slug)) {
            throw DuplicateResourceException.slug(slug);
        }

        User author = userRepository.findById(userId)
                .orElseThrow(() -> ResourceNotFoundException.user(userId));

        String displayName = author.getProfile() != null
                ? author.getProfile().getDisplayName()
                : author.getUsername();

        List<String> outgoingLinks = parseBacklinks(request.getContent());

        VaultNote note = VaultNote.builder()
                .title(request.getTitle())
                .slug(slug)
                .content(request.getContent())
                .folderId(request.getFolderId())
                .author(VaultNote.AuthorInfo.builder()
                        .id(author.getId())
                        .name(displayName)
                        .build())
                .outgoingLinks(outgoingLinks)
                .tags(request.getTags() != null ? request.getTags() : new ArrayList<>())
                .build();

        VaultNote saved = vaultNoteRepository.save(note);
        vaultFolderService.incrementNoteCount(request.getFolderId());
        return saved;
    }

    @Transactional
    public VaultNote update(String id, VaultNoteUpdateRequest request) {
        VaultNote note = findById(id);

        if (request.getTitle() != null) note.setTitle(request.getTitle());
        if (request.getSlug() != null && !request.getSlug().equals(note.getSlug())) {
            if (vaultNoteRepository.existsBySlug(request.getSlug())) {
                throw DuplicateResourceException.slug(request.getSlug());
            }
            note.setSlug(request.getSlug());
        }
        if (request.getContent() != null) {
            note.setContent(request.getContent());
            note.setOutgoingLinks(parseBacklinks(request.getContent()));
        }
        if (request.getFolderId() != null && !request.getFolderId().equals(note.getFolderId())) {
            vaultFolderService.decrementNoteCount(note.getFolderId());
            vaultFolderService.incrementNoteCount(request.getFolderId());
            note.setFolderId(request.getFolderId());
        }
        if (request.getTags() != null) note.setTags(request.getTags());

        return vaultNoteRepository.save(note);
    }

    @Transactional
    public void delete(String id) {
        VaultNote note = findById(id);
        vaultNoteCommentRepository.deleteAllByNoteId(id);
        vaultFolderService.decrementNoteCount(note.getFolderId());
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
     */
    public GraphDataResponse getGraphData() {
        List<VaultNote> allNotes = vaultNoteRepository.findAll();

        List<GraphDataResponse.GraphNode> nodes = allNotes.stream()
                .map(note -> GraphDataResponse.GraphNode.builder()
                        .id(note.getId())
                        .name(note.getTitle())
                        .slug(note.getSlug())
                        .size(note.getOutgoingLinks().size() + 1)
                        .build())
                .toList();

        List<GraphDataResponse.GraphLink> links = new ArrayList<>();
        for (VaultNote note : allNotes) {
            for (String targetId : note.getOutgoingLinks()) {
                links.add(GraphDataResponse.GraphLink.builder()
                        .source(note.getId())
                        .target(targetId)
                        .build());
            }
        }

        return GraphDataResponse.builder()
                .nodes(nodes)
                .links(links)
                .build();
    }

    @Transactional
    public void incrementCommentCount(String noteId) {
        VaultNote note = findById(noteId);
        note.setCommentsCount(note.getCommentsCount() + 1);
        vaultNoteRepository.save(note);
    }

    @Transactional
    public void decrementCommentCount(String noteId) {
        VaultNote note = findById(noteId);
        note.setCommentsCount(Math.max(0, note.getCommentsCount() - 1));
        vaultNoteRepository.save(note);
    }

    /**
     * 마크다운 내 [[백링크]] 파싱 -> 참조 대상 노트 ID 목록 추출
     * [[제목]] 형태에서 제목을 슬러그로 변환 후 노트 ID 조회
     */
    private List<String> parseBacklinks(String content) {
        if (content == null) return new ArrayList<>();

        List<String> links = new ArrayList<>();
        Matcher matcher = BACKLINK_PATTERN.matcher(content);

        while (matcher.find()) {
            String linkTitle = matcher.group(1).trim();
            String slug = SlugUtils.generate(linkTitle);
            vaultNoteRepository.findBySlug(slug)
                    .ifPresent(note -> links.add(note.getId()));
        }

        return links;
    }
}
