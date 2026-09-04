package com.kscold.blog.notification.adapter.in.web;

import com.kscold.blog.notification.adapter.in.web.dto.response.MessageDeliveryLogResponse;
import com.kscold.blog.notification.adapter.in.web.dto.response.MessageDeliveryStatusResponse;
import com.kscold.blog.notification.application.port.in.MessageDeliveryUseCase;
import com.kscold.blog.notification.domain.model.MessageDeliveryLog;
import com.kscold.blog.shared.web.ApiResponse;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** 알림톡·이메일이 실제로 나갔는지, 도착했는지 확인하는 관리자 화면용 API. */
@RestController
@RequestMapping("/admin/message-deliveries")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminMessageDeliveryController {

    private final MessageDeliveryUseCase useCase;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<MessageDeliveryLogResponse>>> getLogs(
            @RequestParam(required = false) MessageDeliveryLog.Channel channel,
            @RequestParam(required = false) MessageDeliveryLog.Status status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "30") int size) {
        Page<MessageDeliveryLogResponse> logs =
                useCase.search(channel, status, PageRequest.of(page, size))
                        .map(MessageDeliveryLogResponse::from);
        return ResponseEntity.ok(ApiResponse.success(logs));
    }

    /** 공급자에게 실제 도달 상태를 다시 물어본다. 실패 사유와 최종 문구를 여기서 확인한다. */
    @GetMapping("/{providerGroupId}/status")
    public ResponseEntity<ApiResponse<List<MessageDeliveryStatusResponse>>> getProviderStatus(
            @PathVariable String providerGroupId) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        MessageDeliveryStatusResponse.from(
                                useCase.getProviderStatus(providerGroupId))));
    }
}
