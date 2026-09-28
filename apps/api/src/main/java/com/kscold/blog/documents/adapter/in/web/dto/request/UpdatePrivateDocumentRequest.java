package com.kscold.blog.documents.adapter.in.web.dto.request;

import com.kscold.blog.documents.domain.model.PrivateDocumentMetadata;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class UpdatePrivateDocumentRequest {

    @NotBlank
    @Size(max = 160)
    private String title;

    @NotBlank
    @Size(max = 20)
    private String category;

    @Size(max = 2000)
    private String description;

    public PrivateDocumentMetadata toMetadata() {
        return new PrivateDocumentMetadata(
                title, PrivateDocumentCategoryArgument.parse(category, null), description);
    }
}
