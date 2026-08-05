package com.kscold.blog.notification.application.port.in;

import com.kscold.blog.notification.application.dto.AlimtalkTemplateUpdateCommand;
import com.kscold.blog.notification.domain.model.AlimtalkTemplate;
import java.util.List;

public interface AlimtalkTemplateUseCase {

    List<AlimtalkTemplate> getTemplates();

    AlimtalkTemplate getTemplate(String templateKey);

    AlimtalkTemplate update(AlimtalkTemplateUpdateCommand command);
}
