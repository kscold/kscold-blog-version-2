package com.kscold.blog.teamprivate.adapter.in.web.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class PasswordRequest {
    private String password;
    private String teamId;
}
