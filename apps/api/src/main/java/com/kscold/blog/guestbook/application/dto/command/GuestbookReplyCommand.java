package com.kscold.blog.guestbook.application.dto.command;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class GuestbookReplyCommand {

    @NotBlank(message = "답글 내용은 필수입니다")
    @Size(max = 500, message = "답글은 최대 500자입니다")
    private String content;
}
