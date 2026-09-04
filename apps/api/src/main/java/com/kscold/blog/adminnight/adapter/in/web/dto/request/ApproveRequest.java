package com.kscold.blog.adminnight.adapter.in.web.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class ApproveRequest {

    @Valid
    @NotNull(message = "승인할 시간을 지정해주세요")
    private SlotRequest scheduledSlot;
}
