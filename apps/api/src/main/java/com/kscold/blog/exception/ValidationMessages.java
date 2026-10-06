package com.kscold.blog.exception;

import jakarta.validation.ConstraintViolation;
import java.lang.reflect.Field;
import java.util.Arrays;
import java.util.Collection;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;

/**
 * 검증 실패 메시지를 항상 같은 순서로 잇는다.
 *
 * <p>검증기는 위반 사항을 순서 없는 집합으로 돌려준다. 그대로 이으면 같은 입력에도 안내 문구의 순서가 요청마다 달라지므로, 요청 객체에 필드를 선언한 순서(화면의 입력
 * 순서와 같다)를 기준으로 정렬한다.
 */
final class ValidationMessages {

    private static final String SEPARATOR = ", ";

    private ValidationMessages() {}

    static String join(BindingResult bindingResult) {
        List<String> declaredFields = declaredFieldNames(bindingResult.getTarget());
        return bindingResult.getFieldErrors().stream()
                .sorted(
                        Comparator.comparingInt(
                                        (FieldError error) ->
                                                declarationIndex(declaredFields, error.getField()))
                                .thenComparing(FieldError::getField)
                                .thenComparing(error -> String.valueOf(error.getDefaultMessage())))
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.joining(SEPARATOR));
    }

    static String join(Collection<? extends ConstraintViolation<?>> violations) {
        return violations.stream()
                .sorted(
                        Comparator.comparing(
                                        (ConstraintViolation<?> violation) ->
                                                violation.getPropertyPath().toString())
                                .thenComparing(ConstraintViolation::getMessage))
                .map(ConstraintViolation::getMessage)
                .distinct()
                .collect(Collectors.joining(SEPARATOR));
    }

    private static List<String> declaredFieldNames(Object target) {
        if (target == null) {
            return List.of();
        }
        return Arrays.stream(target.getClass().getDeclaredFields()).map(Field::getName).toList();
    }

    /** 중첩 경로(예: {@code pageContext.sections[0].title})는 맨 앞 필드의 선언 위치를 따른다. */
    private static int declarationIndex(List<String> declaredFields, String fieldPath) {
        String root = fieldPath.split("[.\\[]", 2)[0];
        int index = declaredFields.indexOf(root);
        return index < 0 ? Integer.MAX_VALUE : index;
    }
}
