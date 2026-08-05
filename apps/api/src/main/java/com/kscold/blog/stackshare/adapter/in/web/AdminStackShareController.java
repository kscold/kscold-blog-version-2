package com.kscold.blog.stackshare.adapter.in.web;

import com.kscold.blog.shared.web.ApiResponse;
import com.kscold.blog.stackshare.adapter.in.web.dto.request.SaveStackShareParticipantRequest;
import com.kscold.blog.stackshare.adapter.in.web.dto.request.SendStackShareNotificationsRequest;
import com.kscold.blog.stackshare.adapter.in.web.dto.response.StackShareNotificationResponse;
import com.kscold.blog.stackshare.adapter.in.web.dto.response.StackShareParticipantResponse;
import com.kscold.blog.stackshare.adapter.in.web.dto.response.StackShareSettlementResponse;
import com.kscold.blog.stackshare.application.dto.SaveStackShareParticipantCommand;
import com.kscold.blog.stackshare.application.dto.SendStackShareNotificationsCommand;
import com.kscold.blog.stackshare.application.dto.StackShareRecipientCommand;
import com.kscold.blog.stackshare.application.dto.StackShareSettlementCommand;
import com.kscold.blog.stackshare.application.port.in.StackShareManagementUseCase;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/admin/stack-share")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminStackShareController {

    private final StackShareManagementUseCase useCase;

    @GetMapping("/participants")
    public ResponseEntity<ApiResponse<List<StackShareParticipantResponse>>> getParticipants() {
        var participants =
                useCase.getParticipants().stream()
                        .map(StackShareParticipantResponse::from)
                        .toList();
        return ResponseEntity.ok(ApiResponse.success(participants));
    }

    @PostMapping("/participants")
    public ResponseEntity<ApiResponse<StackShareParticipantResponse>> saveParticipant(
            @Valid @RequestBody SaveStackShareParticipantRequest request) {
        var command =
                new SaveStackShareParticipantCommand(
                        request.getId(),
                        request.getName(),
                        request.getPhoneNumber(),
                        request.getEmail(),
                        request.getUserId());
        return ResponseEntity.ok(
                ApiResponse.success(
                        StackShareParticipantResponse.from(useCase.saveParticipant(command)),
                        "참여자 정보를 저장했습니다."));
    }

    @DeleteMapping("/participants")
    public ResponseEntity<ApiResponse<Void>> deleteParticipant(@RequestParam String id) {
        useCase.deleteParticipant(id);
        return ResponseEntity.ok(ApiResponse.success(null, "참여자를 삭제했습니다."));
    }

    @GetMapping("/settlements")
    public ResponseEntity<ApiResponse<List<StackShareSettlementResponse>>> getSettlements() {
        var settlements =
                useCase.getSettlements().stream().map(StackShareSettlementResponse::from).toList();
        return ResponseEntity.ok(ApiResponse.success(settlements));
    }

    @PostMapping("/settlements/send")
    public ResponseEntity<ApiResponse<StackShareNotificationResponse>> send(
            @Valid @RequestBody SendStackShareNotificationsRequest request) {
        var settlement =
                new StackShareSettlementCommand(
                        request.getToolName(),
                        request.getBillingPeriod(),
                        request.getTotalAmount());
        var recipients =
                request.getRecipients().stream()
                        .map(
                                recipient ->
                                        new StackShareRecipientCommand(
                                                recipient.getName(),
                                                recipient.getPhoneNumber(),
                                                recipient.getEmail()))
                        .toList();
        var result =
                useCase.createAndSend(
                        new SendStackShareNotificationsCommand(settlement, recipients));
        return ResponseEntity.ok(
                ApiResponse.success(
                        StackShareNotificationResponse.from(result), "정산을 저장하고 알림톡 발송을 요청했습니다."));
    }
}
