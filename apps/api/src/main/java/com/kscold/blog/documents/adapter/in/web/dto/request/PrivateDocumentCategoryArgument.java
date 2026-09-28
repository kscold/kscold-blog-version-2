package com.kscold.blog.documents.adapter.in.web.dto.request;

import com.kscold.blog.documents.domain.model.PrivateDocumentCategory;
import com.kscold.blog.exception.InvalidRequestException;

public final class PrivateDocumentCategoryArgument {

    private PrivateDocumentCategoryArgument() {}

    public static PrivateDocumentCategory parse(
            String value, PrivateDocumentCategory fallbackCategory) {
        if (value == null || value.isBlank()) {
            return fallbackCategory;
        }
        try {
            return PrivateDocumentCategory.valueOf(value);
        } catch (IllegalArgumentException exception) {
            throw InvalidRequestException.invalidInput("문서 분류를 확인해주세요.");
        }
    }
}
