package com.kscold.blog.media.application.service;

import com.kscold.blog.exception.InvalidRequestException;
import com.kscold.blog.media.application.dto.AdminStorageListing;
import com.kscold.blog.media.application.dto.AdminStorageObjectResource;
import com.kscold.blog.media.domain.port.out.AdminStoragePort;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminStorageApplicationServiceTest {

    @Mock
    private AdminStoragePort adminStoragePort;

    @InjectMocks
    private AdminStorageApplicationService adminStorageApplicationService;

    @Test
    @DisplayName("시나리오: 관리자는 현재 prefix 기준으로 저장소 목록을 확인할 수 있다")
    void getListingDelegatesToPort() {
        AdminStorageListing listing = AdminStorageListing.builder()
                .bucket("blog")
                .currentPrefix("images/")
                .parentPrefix("")
                .folders(List.of())
                .objects(List.of())
                .build();
        when(adminStoragePort.list("images/")).thenReturn(listing);

        AdminStorageListing result = adminStorageApplicationService.getListing("images/");

        assertThat(result.getBucket()).isEqualTo("blog");
        assertThat(result.getCurrentPrefix()).isEqualTo("images/");
    }

    @Test
    @DisplayName("시나리오: 폴더 이름 없이 관리자 저장소 폴더를 만들 수는 없다")
    void createFolderRejectsBlankName() {
        assertThatThrownBy(() -> adminStorageApplicationService.createFolder("", "   "))
                .isInstanceOf(InvalidRequestException.class)
                .hasMessageContaining("폴더 이름");

        verify(adminStoragePort, never()).createFolder("", "   ");
    }

    @Test
    @DisplayName("시나리오: 관리자는 파일 업로드 후 최신 저장소 목록을 바로 받는다")
    void uploadFilesReturnsRefreshedListing() {
        MockMultipartFile file = new MockMultipartFile(
                "files",
                "hero.png",
                "image/png",
                new byte[]{1, 2, 3}
        );
        AdminStorageListing listing = AdminStorageListing.builder()
                .bucket("blog")
                .currentPrefix("")
                .parentPrefix(null)
                .folders(List.of())
                .objects(List.of())
                .build();
        when(adminStoragePort.list("")).thenReturn(listing);

        AdminStorageListing result = adminStorageApplicationService.uploadFiles("", List.of(file));

        verify(adminStoragePort).uploadFiles("", List.of(file));
        verify(adminStoragePort).list("");
        assertThat(result.getBucket()).isEqualTo("blog");
    }

    @Test
    @DisplayName("시나리오: 삭제 후 응답에는 실제로 지워진 키 개수가 포함된다")
    void deleteEntryReturnsDeletedCount() {
        AdminStorageListing listing = AdminStorageListing.builder()
                .bucket("blog")
                .currentPrefix("")
                .parentPrefix(null)
                .folders(List.of())
                .objects(List.of())
                .build();
        when(adminStoragePort.deleteEntry("images/")).thenReturn(3);
        when(adminStoragePort.list("")).thenReturn(listing);

        AdminStorageListing result = adminStorageApplicationService.deleteEntry("", "images/");

        assertThat(result.getDeletedKeys()).isEqualTo(3);
    }

    @Test
    @DisplayName("시나리오: 관리자는 개별 파일 리소스를 그대로 조회할 수 있다")
    void getObjectReturnsResource() {
        AdminStorageObjectResource resource = AdminStorageObjectResource.builder()
                .fileName("hero.png")
                .contentType("image/png")
                .contentLength(3L)
                .buffer(new byte[]{1, 2, 3})
                .build();
        when(adminStoragePort.getObject("hero.png")).thenReturn(resource);

        AdminStorageObjectResource result = adminStorageApplicationService.getObject("hero.png");

        assertThat(result.getFileName()).isEqualTo("hero.png");
        assertThat(result.getContentLength()).isEqualTo(3L);
    }
}
