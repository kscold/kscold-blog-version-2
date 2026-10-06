package com.kscold.blog.exception;

import static org.assertj.core.api.Assertions.assertThat;

import com.kscold.blog.shared.web.ApiResponse;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

class StatusErrorResponseTest {

    @ParameterizedTest
    @CsvSource({
        "400, E001, 잘못된 요청입니다.",
        "401, E101, 인증이 필요합니다. 다시 로그인해주세요.",
        "403, E201, 접근 권한이 없습니다.",
        "404, E301, 요청한 리소스를 찾을 수 없습니다.",
        "405, E004, 지원하지 않는 요청 방식입니다.",
        "406, E001, 요청한 응답 형식을 지원하지 않습니다.",
        "413, E001, 요청 크기가 허용 범위를 넘었습니다.",
        "415, E001, 지원하지 않는 요청 본문 형식입니다.",
        "429, E501, 요청이 너무 많습니다. 잠시 후 다시 시도해주세요.",
        "418, E001, 잘못된 요청입니다.",
        "500, E901, 서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
        "503, E901, 서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
    })
    void keepsTheStatusAndDescribesItInTheStandardFormat(int status, String code, String message) {
        ResponseEntity<ApiResponse<Void>> response =
                StatusErrorResponse.of(HttpStatusCode.valueOf(status));

        assertThat(response.getStatusCode().value()).isEqualTo(status);
        assertThat(response.getBody().isSuccess()).isFalse();
        assertThat(response.getBody().getErrorCode()).isEqualTo(code);
        assertThat(response.getBody().getMessage()).isEqualTo(message);
    }

    @Test
    void fixesTheResponseFormatSoItIsWrittenWhateverTheRequestAccepts() {
        assertThat(
                        StatusErrorResponse.of(HttpStatusCode.valueOf(406))
                                .getHeaders()
                                .getContentType())
                .isEqualTo(MediaType.APPLICATION_JSON);
    }
}
