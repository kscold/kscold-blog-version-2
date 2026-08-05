package com.kscold.blog.notification.adapter.in.web;

import com.kscold.blog.notification.adapter.in.web.dto.request.UpdateAlimtalkTemplateRequest;
import com.kscold.blog.notification.adapter.in.web.dto.response.AlimtalkTemplateResponse;
import com.kscold.blog.notification.application.dto.AlimtalkTemplateUpdateCommand;
import com.kscold.blog.notification.application.port.in.AlimtalkTemplateUseCase;
import com.kscold.blog.shared.web.ApiResponse;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/admin/notification-templates")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminAlimtalkTemplateController {

    private final AlimtalkTemplateUseCase useCase;

    @GetMapping
    public ResponseEntity<ApiResponse<List<AlimtalkTemplateResponse>>> getTemplates() {
        List<AlimtalkTemplateResponse> templates =
                useCase.getTemplates().stream().map(AlimtalkTemplateResponse::from).toList();
        return ResponseEntity.ok(ApiResponse.success(templates));
    }

    @PutMapping("/{templateKey}")
    public ResponseEntity<ApiResponse<AlimtalkTemplateResponse>> update(
            @PathVariable String templateKey,
            @Valid @RequestBody UpdateAlimtalkTemplateRequest request) {
        var command =
                new AlimtalkTemplateUpdateCommand(
                        templateKey, request.getExternalTemplateId(), request.getStatus());
        return ResponseEntity.ok(
                ApiResponse.success(
                        AlimtalkTemplateResponse.from(useCase.update(command)),
                        "알림톡 템플릿 설정을 저장했습니다."));
    }
}
