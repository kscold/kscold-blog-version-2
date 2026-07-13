package com.kscold.blog.adminnight.adapter.in.web.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class ApproveRequest {

    private SlotRequest scheduledSlot;
}
