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
import java.util.Objects;
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
                            existing -> refreshFromDefaults(existing, defaults),
                            () -> repository.save(defaults));
        }
    }

    /**
     * 아직 카카오에 제출하지 않은(DRAFT) 템플릿만 최신 기본 문구로 맞춘다.
     *
     * <p>SUBMITTED·APPROVED 는 카카오에 등록된 본문과 글자까지 같아야 하므로 코드가 덮어쓰지 않는다.
     */
    private void refreshFromDefaults(AlimtalkTemplate existing, AlimtalkTemplate defaults) {
        boolean changed = backfillPresentation(existing, defaults);
        if (existing.getStatus() == AlimtalkTemplateStatus.DRAFT
                && hasDraftDifference(existing, defaults)) {
            copyDraftFields(existing, defaults);
            changed = true;
        }
        if (changed) {
            repository.save(existing);
        }
    }

    private boolean backfillPresentation(AlimtalkTemplate existing, AlimtalkTemplate defaults) {
        boolean changed = false;
        if (shouldBackfillType(existing, defaults)) {
            existing.setTemplateType(defaults.getTemplateType());
            changed = true;
        }
        if (existing.getEmphasisTitle() == null && defaults.getEmphasisTitle() != null) {
            existing.setEmphasisTitle(defaults.getEmphasisTitle());
            changed = true;
        }
        if (existing.getEmphasisSubtitle() == null && defaults.getEmphasisSubtitle() != null) {
            existing.setEmphasisSubtitle(defaults.getEmphasisSubtitle());
            changed = true;
        }
        return changed;
    }

    private boolean shouldBackfillType(AlimtalkTemplate existing, AlimtalkTemplate defaults) {
        if (existing.getTemplateType() == null) {
            return true;
        }
        return defaults.getTemplateType() != existing.getTemplateType()
                && Objects.equals(existing.getEmphasisTitle(), defaults.getEmphasisTitle());
    }

    private boolean hasDraftDifference(AlimtalkTemplate existing, AlimtalkTemplate defaults) {
        return !Objects.equals(existing.getName(), defaults.getName())
                || !Objects.equals(existing.getPurpose(), defaults.getPurpose())
                || !Objects.equals(existing.getBody(), defaults.getBody())
                || !Objects.equals(existing.getTemplateType(), defaults.getTemplateType())
                || !Objects.equals(existing.getEmphasisTitle(), defaults.getEmphasisTitle())
                || !Objects.equals(existing.getEmphasisSubtitle(), defaults.getEmphasisSubtitle())
                || !Objects.equals(existing.getVariables(), defaults.getVariables());
    }

    private void copyDraftFields(AlimtalkTemplate existing, AlimtalkTemplate defaults) {
        existing.setName(defaults.getName());
        existing.setPurpose(defaults.getPurpose());
        existing.setBody(defaults.getBody());
        existing.setTemplateType(defaults.getTemplateType());
        existing.setEmphasisTitle(defaults.getEmphasisTitle());
        existing.setEmphasisSubtitle(defaults.getEmphasisSubtitle());
        existing.setVariables(defaults.getVariables());
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
