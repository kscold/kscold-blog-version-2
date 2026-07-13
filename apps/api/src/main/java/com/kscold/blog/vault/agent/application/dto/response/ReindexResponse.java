package com.kscold.blog.vault.agent.application.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class ReindexResponse {

    private int totalNotes;
    private int indexedNotes;
    private int skippedNotes;
}
