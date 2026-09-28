package com.kscold.blog.documents.adapter.in.web;

import com.kscold.blog.documents.adapter.in.web.dto.request.SearchPrivateDocumentsRequest;
import com.kscold.blog.documents.adapter.in.web.dto.request.UpdatePrivateDocumentRequest;
import com.kscold.blog.documents.adapter.in.web.dto.request.UploadPrivateDocumentRequest;
import com.kscold.blog.documents.adapter.in.web.dto.response.PrivateDocumentResponse;
import com.kscold.blog.documents.application.dto.UploadPrivateDocumentCommand;
import com.kscold.blog.documents.application.port.in.PrivateDocumentUseCase;
import com.kscold.blog.documents.domain.model.PrivateDocumentDownload;
import com.kscold.blog.documents.domain.model.PrivateDocumentFile;
import com.kscold.blog.shared.web.ApiResponse;
import jakarta.validation.Valid;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;

@RestController
@RequestMapping("/admin/documents")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class PrivateDocumentController {

    private final PrivateDocumentUseCase useCase;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<PrivateDocumentResponse>>> search(
            @AuthenticationPrincipal String ownerId,
            @Valid @ModelAttribute SearchPrivateDocumentsRequest request) {
        return ResponseEntity.ok()
                .headers(privateHeaders())
                .body(
                        ApiResponse.success(
                                useCase.search(request.toCommand(ownerId))
                                        .map(PrivateDocumentResponse::from)));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<PrivateDocumentResponse>> upload(
            @AuthenticationPrincipal String ownerId,
            @RequestPart("file") MultipartFile file,
            @Valid @ModelAttribute UploadPrivateDocumentRequest request)
            throws IOException {
        try (InputStream inputStream = file.getInputStream()) {
            PrivateDocumentFile source =
                    new PrivateDocumentFile(
                            file.getOriginalFilename(),
                            file.getContentType(),
                            file.getSize(),
                            inputStream);
            PrivateDocumentResponse response =
                    PrivateDocumentResponse.from(
                            useCase.upload(
                                    new UploadPrivateDocumentCommand(
                                            ownerId, source, request.toMetadata())));
            return ResponseEntity.status(HttpStatus.CREATED)
                    .headers(privateHeaders())
                    .body(ApiResponse.success(response, "개인 문서를 업로드했습니다."));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PrivateDocumentResponse>> update(
            @AuthenticationPrincipal String ownerId,
            @PathVariable String id,
            @Valid @RequestBody UpdatePrivateDocumentRequest request) {
        return ResponseEntity.ok()
                .headers(privateHeaders())
                .body(
                        ApiResponse.success(
                                PrivateDocumentResponse.from(
                                        useCase.update(ownerId, id, request.toMetadata()))));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @AuthenticationPrincipal String ownerId, @PathVariable String id) {
        useCase.delete(ownerId, id);
        return ResponseEntity.ok().headers(privateHeaders()).body(ApiResponse.success());
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<StreamingResponseBody> download(
            @AuthenticationPrincipal String ownerId, @PathVariable String id) {
        PrivateDocumentDownload document = useCase.download(ownerId, id);
        ContentDisposition disposition =
                ContentDisposition.attachment()
                        .filename(document.fileName(), StandardCharsets.UTF_8)
                        .build();
        StreamingResponseBody body =
                outputStream -> {
                    try (InputStream inputStream = document.inputStream()) {
                        inputStream.transferTo(outputStream);
                    }
                };
        return ResponseEntity.ok()
                .headers(privateHeaders())
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .contentLength(document.size())
                .header(HttpHeaders.CONTENT_DISPOSITION, disposition.toString())
                .header("X-Content-Type-Options", "nosniff")
                .header(
                        "Content-Security-Policy",
                        "sandbox; default-src 'none'; frame-ancestors 'none'")
                .body(body);
    }

    private HttpHeaders privateHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setCacheControl("no-store");
        headers.setPragma("no-cache");
        headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
        return headers;
    }
}
