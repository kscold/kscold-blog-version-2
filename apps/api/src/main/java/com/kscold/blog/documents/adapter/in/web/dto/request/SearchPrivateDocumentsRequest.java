package com.kscold.blog.documents.adapter.in.web.dto.request;

import com.kscold.blog.documents.application.dto.SearchPrivateDocumentsCommand;
import com.kscold.blog.documents.domain.model.PrivateDocumentSearchCriteria;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class SearchPrivateDocumentsRequest {

    @Size(max = 20)
    private String category;

    @Size(max = 100)
    private String query;

    @Min(0)
    private Integer page;

    @Min(1)
    @Max(48)
    private Integer size;

    public SearchPrivateDocumentsCommand toCommand(String ownerId) {
        return new SearchPrivateDocumentsCommand(
                new PrivateDocumentSearchCriteria(
                        ownerId, PrivateDocumentCategoryArgument.parse(category, null), query),
                page == null ? 0 : page,
                size == null ? 12 : size);
    }
}
