package com.kscold.blog.guestbook.application.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class GuestbookEntryCreateCommand {

    @NotBlank(message = "방명록 내용은 필수입니다")
    @Size(max = 500, message = "방명록은 최대 500자입니다")
    private String content;
}
