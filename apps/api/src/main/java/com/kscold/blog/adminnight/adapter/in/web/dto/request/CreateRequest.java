package com.kscold.blog.adminnight.adapter.in.web.dto.request;

import com.kscold.blog.adminnight.domain.model.AdminNightRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class CreateRequest {

    @NotBlank(message = "실명을 입력해주세요")
    @Size(max = 40, message = "실명은 최대 40자입니다")
    private String requesterName;

    @NotBlank(message = "끝낼 일을 적어주세요")
    @Size(max = 120, message = "끝낼 일은 최대 120자입니다")
    private String taskTitle;

    @Size(max = 1000, message = "메시지는 최대 1000자입니다")
    private String message;

    @NotNull(message = "온라인/오프라인 진행 방식을 골라주세요")
    private AdminNightRequest.ParticipationMode participationMode;

    @Valid
    @NotNull(message = "만날 시간을 골라주세요")
    private SlotRequest preferredSlot;
}
