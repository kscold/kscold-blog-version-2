package com.kscold.blog.notification.application.service;

import com.kscold.blog.exception.BusinessException;
import com.kscold.blog.exception.ErrorCode;
import com.kscold.blog.notification.application.dto.AlimtalkTemplateUpdateCommand;
import com.kscold.blog.notification.application.port.in.AlimtalkTemplateUseCase;
import com.kscold.blog.notification.domain.model.AlimtalkTemplate;
import com.kscold.blog.notification.domain.port.out.AlimtalkTemplateRepository;
import java.util.Comparator;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AlimtalkTemplateApplicationService implements AlimtalkTemplateUseCase {

    private final AlimtalkTemplateRepository repository;

    @EventListener(ApplicationReadyEvent.class)
    public void seedDefaults() {
        for (AlimtalkTemplate template : AlimtalkTemplateDefaults.create()) {
            if (repository.findByTemplateKey(template.getTemplateKey()).isEmpty()) {
                repository.save(template);
            }
        }
    }

    @Override
    public List<AlimtalkTemplate> getTemplates() {
        seedDefaults();
        return repository.findAll().stream()
                .sorted(Comparator.comparing(AlimtalkTemplate::getTemplateKey))
                .toList();
    }

    @Override
    public AlimtalkTemplate getTemplate(String templateKey) {
        return repository
                .findByTemplateKey(templateKey)
                .orElseThrow(
                        () ->
                                new BusinessException(
                                        ErrorCode.RESOURCE_NOT_FOUND, "알림톡 템플릿을 찾지 못했습니다."));
    }

    @Override
    public AlimtalkTemplate update(AlimtalkTemplateUpdateCommand command) {
        AlimtalkTemplate template = getTemplate(command.templateKey());
        template.setExternalTemplateId(normalize(command.externalTemplateId()));
        template.setStatus(command.status());
        return repository.save(template);
    }

    private String normalize(String value) {
        return value == null ? "" : value.trim();
    }
}
