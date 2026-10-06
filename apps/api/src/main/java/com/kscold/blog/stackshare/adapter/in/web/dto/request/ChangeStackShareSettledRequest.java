package com.kscold.blog.stackshare.adapter.in.web.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class ChangeStackShareSettledRequest {

    /** 완료 여부를 바꿀 정산 기록. */
    @NotBlank private String id;

    /** true 면 정산 완료로 표시하고, false 면 완료 표시를 되돌린다. */
    private boolean settled;
}
