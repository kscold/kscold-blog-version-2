package com.kscold.blog.notification.adapter.in.web.dto.request;

import com.kscold.blog.notification.domain.model.AlimtalkTemplateStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class UpdateAlimtalkTemplateRequest {

    private String externalTemplateId;

    @NotNull private AlimtalkTemplateStatus status;
}
