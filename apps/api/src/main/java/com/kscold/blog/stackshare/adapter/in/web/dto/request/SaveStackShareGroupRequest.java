package com.kscold.blog.stackshare.adapter.in.web.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class SaveStackShareGroupRequest {

    /** 비어 있으면 새 그룹을 만든다. */
    private String id;

    @NotBlank
    @Size(max = 30)
    private String name;

    /** 이 그룹으로 정산할 때 기본으로 채울 서비스명. 예) "Codex x20" */
    @Size(max = 60)
    private String defaultToolName;

    /** 결제한 본인도 분담 인원에 넣을지 기본값. */
    private boolean includeOwner;

    @Size(max = 100)
    private List<String> participantIds;
}
