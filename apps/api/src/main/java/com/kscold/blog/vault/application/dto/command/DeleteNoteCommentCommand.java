package com.kscold.blog.vault.application.dto.command;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class DeleteNoteCommentCommand {

    @NotBlank(message = "비밀번호는 필수입니다")
    private String password;
}
