package com.kscold.blog.notification.application.dto;

import com.kscold.blog.notification.domain.model.AlimtalkTemplateStatus;

public record AlimtalkTemplateUpdateCommand(
        String templateKey, String externalTemplateId, AlimtalkTemplateStatus status) {}
