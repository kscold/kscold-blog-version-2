package com.kscold.blog.dto.request;

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
public class FeedCommentCreateRequest {

    @NotBlank(message = "닉네임은 필수입니다")
    @Size(max = 20, message = "닉네임은 최대 20자입니다")
    private String authorName;

    @NotBlank(message = "비밀번호는 필수입니다")
    @Size(min = 4, max = 20, message = "비밀번호는 4-20자입니다")
    private String authorPassword;

    @NotBlank(message = "댓글 내용은 필수입니다")
    @Size(max = 500, message = "댓글은 최대 500자입니다")
    private String content;
}
