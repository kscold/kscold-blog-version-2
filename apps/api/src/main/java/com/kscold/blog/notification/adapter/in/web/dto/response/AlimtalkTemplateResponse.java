package com.kscold.blog.notification.adapter.in.web.dto.response;

import com.kscold.blog.notification.domain.model.AlimtalkTemplate;
import com.kscold.blog.notification.domain.model.AlimtalkTemplateStatus;
import java.time.LocalDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AlimtalkTemplateResponse {

    private String templateKey;
    private String name;
    private String purpose;
    private String body;
    private List<String> variables;
    private String externalTemplateId;
    private AlimtalkTemplateStatus status;
    private LocalDateTime updatedAt;

    public static AlimtalkTemplateResponse from(AlimtalkTemplate template) {
        return AlimtalkTemplateResponse.builder()
                .templateKey(template.getTemplateKey())
                .name(template.getName())
                .purpose(template.getPurpose())
                .body(template.getBody())
                .variables(template.getVariables())
                .externalTemplateId(template.getExternalTemplateId())
                .status(template.getStatus())
                .updatedAt(template.getUpdatedAt())
                .build();
    }
}
