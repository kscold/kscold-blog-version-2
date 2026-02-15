package com.kscold.blog.exception;

/**
 * 요청한 리소스를 찾을 수 없을 때 발생하는 예외
 * HTTP 404 Not Found 응답
 */
public class ResourceNotFoundException extends BusinessException {

    public ResourceNotFoundException(ErrorCode errorCode) {
        super(errorCode);
    }

    public ResourceNotFoundException(ErrorCode errorCode, String message) {
        super(errorCode, message);
    }

    public static ResourceNotFoundException user(String userId) {
        return new ResourceNotFoundException(
            ErrorCode.USER_NOT_FOUND,
            String.format("사용자를 찾을 수 없습니다 (ID: %s)", userId)
        );
    }

    public static ResourceNotFoundException post(String postId) {
        return new ResourceNotFoundException(
            ErrorCode.POST_NOT_FOUND,
            String.format("포스트를 찾을 수 없습니다 (ID: %s)", postId)
        );
    }

    public static ResourceNotFoundException postBySlug(String slug) {
        return new ResourceNotFoundException(
            ErrorCode.POST_NOT_FOUND,
            String.format("포스트를 찾을 수 없습니다 (Slug: %s)", slug)
        );
    }

    public static ResourceNotFoundException category(String categoryId) {
        return new ResourceNotFoundException(
            ErrorCode.CATEGORY_NOT_FOUND,
            String.format("카테고리를 찾을 수 없습니다 (ID: %s)", categoryId)
        );
    }

    public static ResourceNotFoundException tag(String tagId) {
        return new ResourceNotFoundException(
            ErrorCode.TAG_NOT_FOUND,
            String.format("태그를 찾을 수 없습니다 (ID: %s)", tagId)
        );
    }
}
