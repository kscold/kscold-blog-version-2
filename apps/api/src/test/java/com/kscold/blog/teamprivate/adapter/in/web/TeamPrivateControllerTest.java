package com.kscold.blog.teamprivate.adapter.in.web;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verifyNoInteractions;

import com.kscold.blog.shared.web.ApiResponse;
import com.kscold.blog.teamprivate.adapter.in.web.dto.request.PasswordRequest;
import com.kscold.blog.teamprivate.adapter.in.web.dto.response.TeamPrivateDocResponse;
import com.kscold.blog.teamprivate.application.port.in.TeamPrivateUseCase;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

class TeamPrivateControllerTest {

    @Test
    void 비밀번호_설정이_비어_있으면_비공개_문서를_조회하지_않는다() {
        TeamPrivateUseCase useCase = mock(TeamPrivateUseCase.class);
        TeamPrivateController controller = new TeamPrivateController(useCase, " ");
        PasswordRequest request = PasswordRequest.builder().password("입력값").build();

        ResponseEntity<ApiResponse<TeamPrivateDocResponse>> response =
                controller.getPrivateDocs(request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.SERVICE_UNAVAILABLE);
        verifyNoInteractions(useCase);
    }
}
