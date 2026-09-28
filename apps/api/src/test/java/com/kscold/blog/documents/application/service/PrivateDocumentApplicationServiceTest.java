package com.kscold.blog.documents.application.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import com.kscold.blog.documents.application.dto.SearchPrivateDocumentsCommand;
import com.kscold.blog.documents.application.dto.UploadPrivateDocumentCommand;
import com.kscold.blog.documents.domain.model.PrivateDocument;
import com.kscold.blog.documents.domain.model.PrivateDocumentCategory;
import com.kscold.blog.documents.domain.model.PrivateDocumentFile;
import com.kscold.blog.documents.domain.model.PrivateDocumentMetadata;
import com.kscold.blog.documents.domain.model.PrivateDocumentSearchCriteria;
import com.kscold.blog.documents.domain.port.out.PrivateDocumentRepository;
import com.kscold.blog.documents.domain.port.out.PrivateDocumentStoragePort;
import com.kscold.blog.exception.BusinessException;
import com.kscold.blog.exception.ResourceNotFoundException;
import java.io.ByteArrayInputStream;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@ExtendWith(MockitoExtension.class)
class PrivateDocumentApplicationServiceTest {

    private static final String ID = "2f6290f3-4016-454f-807d-264c9cc42d69";
    @Mock private PrivateDocumentRepository repository;
    @Mock private PrivateDocumentStoragePort storage;
    private PrivateDocumentApplicationService service;

    @BeforeEach
    void setUp() {
        service = new PrivateDocumentApplicationService(repository, storage);
    }

    @Test
    void generatesDistinctKeysForIdenticalFileNames() {
        when(repository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        PrivateDocument first = service.upload(command());
        PrivateDocument second = service.upload(command());
        assertThat(first.getObjectKey()).isNotEqualTo(second.getObjectKey());
        assertThat(first.getObjectKey()).doesNotContain("이력서", "owner");
        assertThat(first.getFileName()).isEqualTo("이력서.pdf");
    }

    @Test
    void rollsBackOnlyNewObjectWhenMetadataSaveFails() {
        IllegalStateException databaseFailure = new IllegalStateException("DB 오류");
        when(repository.save(any())).thenThrow(databaseFailure);
        assertThatThrownBy(() -> service.upload(command())).isSameAs(databaseFailure);
        ArgumentCaptor<String> key = ArgumentCaptor.forClass(String.class);
        verify(storage).upload(key.capture(), any());
        verify(storage).delete(key.getValue());
    }

    @Test
    void preservesOriginalFailureWhenRollbackAlsoFails() {
        IllegalStateException databaseFailure = new IllegalStateException("DB 오류");
        when(repository.save(any())).thenThrow(databaseFailure);
        doThrow(new IllegalStateException("저장소 오류")).when(storage).delete(any());
        assertThatThrownBy(() -> service.upload(command()))
                .isSameAs(databaseFailure)
                .satisfies(failure -> assertThat(failure.getSuppressed()).hasSize(1));
    }

    @Test
    void readsOwnedMetadataWithoutOpeningStoredFile() {
        PrivateDocument expected = document();
        when(repository.findByIdAndOwnerId(ID, "owner")).thenReturn(Optional.of(expected));
        assertThat(service.get("owner", ID)).isSameAs(expected);
        verifyNoInteractions(storage);
    }

    @Test
    void cannotReadAnotherOwnersMetadata() {
        when(repository.findByIdAndOwnerId(ID, "other-owner")).thenReturn(Optional.empty());
        assertThatThrownBy(() -> service.get("other-owner", ID))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("문서를 찾을 수 없습니다.");
        verifyNoInteractions(storage);
    }

    @Test
    void missingMetadataUsesSameNotFoundResponse() {
        when(repository.findByIdAndOwnerId(ID, "owner")).thenReturn(Optional.empty());
        assertThatThrownBy(() -> service.get("owner", ID))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("문서를 찾을 수 없습니다.");
        verifyNoInteractions(storage);
    }

    @Test
    void rejectsInvalidMetadataIdBeforeRepositoryAccess() {
        assertThatThrownBy(() -> service.get("owner", "../private-document"))
                .isInstanceOf(ResourceNotFoundException.class);
        verifyNoInteractions(repository, storage);
    }

    @Test
    void rejectsAnonymousMetadataReadBeforeRepositoryAccess() {
        assertThatThrownBy(() -> service.get("anonymousUser", ID))
                .isInstanceOf(BusinessException.class);
        verifyNoInteractions(repository, storage);
    }

    @Test
    void cannotDownloadAnotherOwnersDocument() {
        when(repository.findByIdAndOwnerId(ID, "other-owner")).thenReturn(Optional.empty());
        assertThatThrownBy(() -> service.download("other-owner", ID))
                .isInstanceOf(ResourceNotFoundException.class);
        verifyNoInteractions(storage);
    }

    @Test
    void cannotDeleteAnotherOwnersDocument() {
        when(repository.findByIdAndOwnerId(ID, "other-owner")).thenReturn(Optional.empty());
        assertThatThrownBy(() -> service.delete("other-owner", ID))
                .isInstanceOf(ResourceNotFoundException.class);
        verifyNoInteractions(storage);
        verify(repository, never()).deleteByIdAndOwnerId(any(), any());
    }

    @Test
    void cannotUpdateAnotherOwnersDocument() {
        when(repository.findByIdAndOwnerId(ID, "other-owner")).thenReturn(Optional.empty());
        assertThatThrownBy(() -> service.update("other-owner", ID, command().metadata()))
                .isInstanceOf(ResourceNotFoundException.class);
        verify(repository, never()).updateMetadata(any(), any(), any());
    }

    @Test
    void keepsMetadataWhenObjectDeletionFails() {
        when(repository.findByIdAndOwnerId(ID, "owner")).thenReturn(Optional.of(document()));
        doThrow(new IllegalStateException("삭제 실패")).when(storage).delete("documents/" + ID);
        assertThatThrownBy(() -> service.delete("owner", ID))
                .isInstanceOf(IllegalStateException.class);
        verify(repository, never()).deleteByIdAndOwnerId(any(), any());
    }

    @Test
    void retriesObjectDeletionAfterMetadataDeletionFails() {
        when(repository.findByIdAndOwnerId(ID, "owner")).thenReturn(Optional.of(document()));
        doThrow(new IllegalStateException("DB 오류"))
                .doNothing()
                .when(repository)
                .deleteByIdAndOwnerId(ID, "owner");
        assertThatThrownBy(() -> service.delete("owner", ID))
                .isInstanceOf(IllegalStateException.class);
        service.delete("owner", ID);
        verify(storage, org.mockito.Mockito.times(2)).delete("documents/" + ID);
    }

    @Test
    void searchesOnlyOwnerWithStableSort() {
        when(repository.findAll(any(), any())).thenReturn(Page.empty());
        PrivateDocumentSearchCriteria criteria =
                new PrivateDocumentSearchCriteria("owner", PrivateDocumentCategory.RESUME, "경력");
        service.search(new SearchPrivateDocumentsCommand(criteria, 0, 12));
        ArgumentCaptor<Pageable> pageable = ArgumentCaptor.forClass(Pageable.class);
        verify(repository).findAll(org.mockito.ArgumentMatchers.eq(criteria), pageable.capture());
        assertThat(pageable.getValue().getSort().toString()).isEqualTo("createdAt: DESC,id: DESC");
    }

    @Test
    void rejectsMissingPrincipalBeforeStorageAccess() {
        UploadPrivateDocumentCommand upload = command();
        assertThatThrownBy(
                        () ->
                                service.upload(
                                        new UploadPrivateDocumentCommand(
                                                "anonymousUser", upload.file(), upload.metadata())))
                .isInstanceOf(BusinessException.class);
        verifyNoInteractions(repository, storage);
    }

    private UploadPrivateDocumentCommand command() {
        return new UploadPrivateDocumentCommand(
                "owner",
                new PrivateDocumentFile(
                        "이력서.pdf",
                        "application/pdf",
                        3,
                        new ByteArrayInputStream(new byte[] {1, 2, 3})),
                new PrivateDocumentMetadata(null, PrivateDocumentCategory.RESUME, "경력 정리"));
    }

    private PrivateDocument document() {
        return PrivateDocument.builder()
                .id(ID)
                .ownerId("owner")
                .objectKey("documents/" + ID)
                .fileName("이력서.pdf")
                .title("이력서")
                .category(PrivateDocumentCategory.RESUME)
                .size(3)
                .build();
    }
}
