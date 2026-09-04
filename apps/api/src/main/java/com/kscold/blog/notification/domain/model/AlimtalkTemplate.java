package com.kscold.blog.notification.domain.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "notification_templates")
public class AlimtalkTemplate {

    @Id private String id;

    @Indexed(unique = true)
    private String templateKey;

    private String name;
    private String purpose;
    private String body;
    private AlimtalkTemplateType templateType;
    private String emphasisTitle;
    private String emphasisSubtitle;

    @Builder.Default private List<String> variables = new ArrayList<>();

    private String externalTemplateId;
    private AlimtalkTemplateStatus status;

    @LastModifiedDate private LocalDateTime updatedAt;

    public boolean isSendable() {
        return status == AlimtalkTemplateStatus.APPROVED
                && externalTemplateId != null
                && !externalTemplateId.isBlank();
    }
}
