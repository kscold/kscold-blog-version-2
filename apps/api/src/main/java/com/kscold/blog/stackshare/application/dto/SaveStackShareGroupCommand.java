package com.kscold.blog.stackshare.application.dto;

import java.util.List;

/**
 * 정산 그룹 저장 커맨드.
 *
 * @param id 비어 있으면 새로 만든다
 * @param includeOwner 이 그룹으로 정산할 때 본인도 인원에 넣을지 기본값
 */
public record SaveStackShareGroupCommand(
        String id,
        String name,
        String defaultToolName,
        boolean includeOwner,
        List<String> participantIds) {}
