package com.kscold.blog.notification.application.service;

import com.kscold.blog.exception.BusinessException;
import com.kscold.blog.exception.ErrorCode;
import com.kscold.blog.notification.application.dto.AlimtalkTemplateUpdateCommand;
import com.kscold.blog.notification.application.port.in.AlimtalkTemplateUseCase;
import com.kscold.blog.notification.domain.model.AlimtalkTemplate;
import com.kscold.blog.notification.domain.model.AlimtalkTemplateStatus;
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
        for (AlimtalkTemplate defaults : AlimtalkTemplateDefaults.create()) {
            repository
                    .findByTemplateKey(defaults.getTemplateKey())
                    .ifPresentOrElse(
                            existing -> refreshIfDraft(existing, defaults),
                            () -> repository.save(defaults));
        }
    }

    /**
     * 아직 카카오에 제출하지 않은(DRAFT) 템플릿만 최신 기본 문구로 맞춘다.
     *
     * <p>SUBMITTED·APPROVED 는 카카오에 등록된 본문과 글자까지 같아야 하므로 코드가 덮어쓰지 않는다.
     */
    private void refreshIfDraft(AlimtalkTemplate existing, AlimtalkTemplate defaults) {
        if (existing.getStatus() != AlimtalkTemplateStatus.DRAFT) {
            return;
        }
        if (defaults.getBody().equals(existing.getBody())
                && defaults.getVariables().equals(existing.getVariables())) {
            return;
        }
        existing.setName(defaults.getName());
        existing.setPurpose(defaults.getPurpose());
        existing.setBody(defaults.getBody());
        existing.setVariables(defaults.getVariables());
        repository.save(existing);
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
