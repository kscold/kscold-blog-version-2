package com.kscold.blog.stackshare.adapter.in.web.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class SaveStackShareParticipantRequest {

    private String id;
    @NotBlank private String name;
    @NotBlank private String phoneNumber;
    private String email;
    private String userId;
}
