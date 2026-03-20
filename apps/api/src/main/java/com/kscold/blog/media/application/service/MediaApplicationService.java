package com.kscold.blog.media.application.service;

import com.kscold.blog.exception.ErrorCode;
import com.kscold.blog.exception.InvalidRequestException;
import com.kscold.blog.media.application.port.in.MediaUseCase;
import com.kscold.blog.media.domain.model.Media;
import com.kscold.blog.media.domain.port.out.FileStoragePort;
import com.kscold.blog.media.domain.port.out.MediaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.Arrays;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class MediaApplicationService implements MediaUseCase {

    private final MediaRepository mediaRepository;
    private final FileStoragePort fileStoragePort;

    @Value("${file.max-size:10485760}")
    private long maxFileSize;

    private static final List<String> ALLOWED_EXTENSIONS = Arrays.asList(
            "jpg", "jpeg", "png", "gif", "webp", "svg"
    );

    private static final List<String> ALLOWED_MIME_TYPES = Arrays.asList(
            "image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"
    );

    @Transactional
    public Media upload(MultipartFile file, String uploaderId, String uploaderName) {
        validateFile(file);

        String fileUrl = fileStoragePort.store(file);

        Media media = Media.builder()
                .originalFilename(file.getOriginalFilename())
                .savedFilename(extractFilename(fileUrl))
                .filePath(fileUrl)
                .fileUrl(fileUrl)
                .contentType(file.getContentType())
                .fileSize(file.getSize())
                .uploader(Media.UploaderInfo.builder()
                        .id(uploaderId)
                        .name(uploaderName)
                        .build())
                .build();

        log.info("File uploaded successfully: {}", fileUrl);

        return mediaRepository.save(media);
    }

    @Transactional
    public void delete(String fileUrl) {
        fileStoragePort.delete(fileUrl);

        mediaRepository.findByFileUrl(fileUrl)
                .ifPresent(mediaRepository::delete);

        log.info("Media deleted successfully: {}", fileUrl);
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new InvalidRequestException(
                    ErrorCode.INVALID_INPUT_VALUE,
                    "파일이 비어있습니다"
            );
        }

        if (file.getSize() > maxFileSize) {
            throw new InvalidRequestException(
                    ErrorCode.INVALID_INPUT_VALUE,
                    String.format("파일 크기가 너무 큽니다 (최대 %dMB)", maxFileSize / 1024 / 1024)
            );
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_MIME_TYPES.contains(contentType)) {
            throw new InvalidRequestException(
                    ErrorCode.INVALID_INPUT_VALUE,
                    "지원하지 않는 파일 형식입니다. 이미지 파일만 업로드 가능합니다"
            );
        }

        String filename = file.getOriginalFilename();
        String extension = getFileExtension(filename);
        if (!ALLOWED_EXTENSIONS.contains(extension.toLowerCase())) {
            throw new InvalidRequestException(
                    ErrorCode.INVALID_INPUT_VALUE,
                    "허용되지 않는 파일 확장자입니다"
            );
        }
    }

    private String getFileExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "";
        }
        return filename.substring(filename.lastIndexOf(".") + 1);
    }

    private String extractFilename(String fileUrl) {
        if (fileUrl == null || !fileUrl.contains("/")) {
            return fileUrl;
        }
        return fileUrl.substring(fileUrl.lastIndexOf("/") + 1);
    }
}
