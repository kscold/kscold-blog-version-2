package com.kscold.blog.vault.agent.adapter.in.web.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class VaultSearchRequest {

    @NotBlank(message = "검색어를 입력해주세요.")
    @Size(min = 2, max = 120, message = "검색어는 2자 이상 120자 이하로 입력해주세요.")
    private String q;

    private String activeFolderName = "";

    @Min(value = 1, message = "검색 결과는 1개 이상이어야 합니다.")
    @Max(value = 20, message = "검색 결과는 20개 이하여야 합니다.")
    private int limit = 8;
}
