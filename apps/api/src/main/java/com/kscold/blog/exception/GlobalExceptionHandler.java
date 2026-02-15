package com.kscold.blog.exception;

import com.kscold.blog.dto.response.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.util.stream.Collectors;

/**
 * 전역 예외 처리 핸들러
 * 모든 컨트롤러에서 발생하는 예외를 일관된 형식으로 변환하여 응답
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * BusinessException 처리
     * 비즈니스 로직에서 발생하는 모든 커스텀 예외 처리
     */
    @ExceptionHandler(BusinessException.class)
    protected ResponseEntity<ApiResponse<Void>> handleBusinessException(BusinessException e) {
        log.warn("BusinessException: code={}, message={}", e.getErrorCode().getCode(), e.getMessage());

        ErrorCode errorCode = e.getErrorCode();
        ApiResponse<Void> response = ApiResponse.error(
            errorCode.getCode(),
            e.getMessage()
        );

        return new ResponseEntity<>(response, errorCode.getStatus());
    }

    /**
     * Validation 예외 처리 (@Valid 실패)
     * DTO 필드 검증 실패 시 발생
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    protected ResponseEntity<ApiResponse<Void>> handleMethodArgumentNotValidException(
        MethodArgumentNotValidException e
    ) {
        log.warn("MethodArgumentNotValidException: {}", e.getMessage());

        String errorMessage = e.getBindingResult()
            .getFieldErrors()
            .stream()
            .map(FieldError::getDefaultMessage)
            .collect(Collectors.joining(", "));

        ApiResponse<Void> response = ApiResponse.error(
            ErrorCode.INVALID_INPUT_VALUE.getCode(),
            errorMessage
        );

        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    /**
     * Bind 예외 처리
     * 요청 파라미터 바인딩 실패 시 발생
     */
    @ExceptionHandler(BindException.class)
    protected ResponseEntity<ApiResponse<Void>> handleBindException(BindException e) {
        log.warn("BindException: {}", e.getMessage());

        String errorMessage = e.getBindingResult()
            .getFieldErrors()
            .stream()
            .map(FieldError::getDefaultMessage)
            .collect(Collectors.joining(", "));

        ApiResponse<Void> response = ApiResponse.error(
            ErrorCode.INVALID_INPUT_VALUE.getCode(),
            errorMessage
        );

        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    /**
     * Type Mismatch 예외 처리
     * 요청 파라미터 타입 불일치 시 발생
     */
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    protected ResponseEntity<ApiResponse<Void>> handleMethodArgumentTypeMismatchException(
        MethodArgumentTypeMismatchException e
    ) {
        log.warn("MethodArgumentTypeMismatchException: {}", e.getMessage());

        String errorMessage = String.format(
            "파라미터 '%s'의 값 '%s'는 타입 '%s'로 변환할 수 없습니다",
            e.getName(),
            e.getValue(),
            e.getRequiredType() != null ? e.getRequiredType().getSimpleName() : "unknown"
        );

        ApiResponse<Void> response = ApiResponse.error(
            ErrorCode.INVALID_TYPE_VALUE.getCode(),
            errorMessage
        );

        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    /**
     * 기타 모든 예외 처리
     * 예상하지 못한 서버 오류
     */
    @ExceptionHandler(Exception.class)
    protected ResponseEntity<ApiResponse<Void>> handleException(Exception e) {
        log.error("Unexpected exception occurred", e);

        ApiResponse<Void> response = ApiResponse.error(
            ErrorCode.INTERNAL_SERVER_ERROR.getCode(),
            "서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
        );

        return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
