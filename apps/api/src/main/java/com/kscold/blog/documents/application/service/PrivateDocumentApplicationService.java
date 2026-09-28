package com.kscold.blog.documents.application.service;

import com.kscold.blog.documents.application.dto.SearchPrivateDocumentsCommand;
import com.kscold.blog.documents.application.dto.UploadPrivateDocumentCommand;
import com.kscold.blog.documents.application.port.in.PrivateDocumentUseCase;
import com.kscold.blog.documents.domain.model.PrivateDocument;
import com.kscold.blog.documents.domain.model.PrivateDocumentDownload;
import com.kscold.blog.documents.domain.model.PrivateDocumentFile;
import com.kscold.blog.documents.domain.model.PrivateDocumentMetadata;
import com.kscold.blog.documents.domain.model.PrivateDocumentPolicy;
import com.kscold.blog.documents.domain.port.out.PrivateDocumentRepository;
import com.kscold.blog.documents.domain.port.out.PrivateDocumentStoragePort;
import com.kscold.blog.exception.BusinessException;
import com.kscold.blog.exception.ErrorCode;
import com.kscold.blog.exception.InvalidRequestException;
import com.kscold.blog.exception.ResourceNotFoundException;
import com.kscold.blog.shared.security.AuthenticatedPrincipalPolicy;
import java.time.Instant;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PrivateDocumentApplicationService implements PrivateDocumentUseCase {

    private final PrivateDocumentRepository repository;
    private final PrivateDocumentStoragePort storage;

    @Override
    public Page<PrivateDocument> search(SearchPrivateDocumentsCommand command) {
        requireOwner(command.criteria().ownerId());
        if (command.page() < 0
                || command.size() < 1
                || command.size() > 48
                || (command.criteria().query() != null
                        && command.criteria().query().length() > 100)) {
            throw InvalidRequestException.invalidInput("검색 조건을 확인해주세요.");
        }
        PageRequest pageable =
                PageRequest.of(
                        command.page(),
                        command.size(),
                        Sort.by(Sort.Direction.DESC, "createdAt", "id"));
        return repository.findAll(command.criteria(), pageable);
    }

    @Override
    public PrivateDocument upload(UploadPrivateDocumentCommand command) {
        String ownerId = requireOwner(command.ownerId());
        PrivateDocumentPolicy.validateFile(command.file());
        String fileName = PrivateDocumentPolicy.sanitizeFileName(command.file().fileName());
        PrivateDocumentMetadata metadata =
                PrivateDocumentPolicy.normalizeMetadata(command.metadata(), fileName);
        String id = UUID.randomUUID().toString();
        PrivateDocumentFile file =
                new PrivateDocumentFile(
                        fileName,
                        PrivateDocumentPolicy.normalizeContentType(command.file().contentType()),
                        command.file().size(),
                        command.file().inputStream());
        String objectKey = "documents/" + id;
        storage.upload(objectKey, file);
        try {
            Instant now = Instant.now();
            return repository.save(
                    PrivateDocument.builder()
                            .id(id)
                            .ownerId(ownerId)
                            .objectKey(objectKey)
                            .title(metadata.title())
                            .fileName(fileName)
                            .category(metadata.category())
                            .description(metadata.description())
                            .size(file.size())
                            .contentType(file.contentType())
                            .createdAt(now)
                            .updatedAt(now)
                            .build());
        } catch (RuntimeException failure) {
            // DB 저장에 실패한 이번 업로드 객체만 되돌린다. 기존 파일은 건드리지 않는다.
            try {
                storage.delete(objectKey);
            } catch (RuntimeException cleanupFailure) {
                failure.addSuppressed(cleanupFailure);
            }
            throw failure;
        }
    }

    @Override
    public PrivateDocument update(String ownerId, String id, PrivateDocumentMetadata metadata) {
        PrivateDocument document = getOwnedDocument(ownerId, id);
        PrivateDocumentMetadata normalized =
                PrivateDocumentPolicy.normalizeMetadata(metadata, document.getTitle());
        // 원자적 수정으로 동시 삭제된 메타데이터가 다시 생성되는 일을 막는다.
        return repository.updateMetadata(id, ownerId, normalized).orElseThrow(this::notFound);
    }

    @Override
    public void delete(String ownerId, String id) {
        PrivateDocument document = getOwnedDocument(ownerId, id);
        // 객체 삭제가 실패하면 메타데이터를 유지한다. 성공 후 DB 실패도 같은 ID로 재시도할 수 있다.
        storage.delete(document.getObjectKey());
        repository.deleteByIdAndOwnerId(id, ownerId);
    }

    @Override
    public PrivateDocumentDownload download(String ownerId, String id) {
        PrivateDocument document = getOwnedDocument(ownerId, id);
        return new PrivateDocumentDownload(
                document.getFileName(),
                document.getSize(),
                storage.download(document.getObjectKey()));
    }

    private PrivateDocument getOwnedDocument(String ownerId, String id) {
        String requiredOwner = requireOwner(ownerId);
        if (id == null || !id.matches("[a-f0-9\\-]{36}")) {
            throw notFound();
        }
        return repository.findByIdAndOwnerId(id, requiredOwner).orElseThrow(this::notFound);
    }

    private String requireOwner(String ownerId) {
        String normalized = AuthenticatedPrincipalPolicy.normalize(ownerId);
        if (normalized == null) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED);
        }
        return normalized;
    }

    private ResourceNotFoundException notFound() {
        return new ResourceNotFoundException(ErrorCode.RESOURCE_NOT_FOUND, "문서를 찾을 수 없습니다.");
    }
}
