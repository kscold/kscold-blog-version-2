package com.kscold.blog.identity.application.dto.command;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.util.List;
import java.util.Map;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class UpdateProfileCommand {

    public static final int DISPLAY_NAME_MAX_LENGTH = 40;
    public static final int BIO_MAX_LENGTH = 200;
    public static final int URL_MAX_LENGTH = 2048;
    public static final int SOCIAL_LINK_MAX_COUNT = 6;
    public static final int TECH_STACK_MAX_COUNT = 30;
    public static final int TECH_STACK_ITEM_MAX_LENGTH = 40;

    @Size(max = DISPLAY_NAME_MAX_LENGTH, message = "표시 이름은 최대 40자입니다")
    private String displayName;

    @Size(max = BIO_MAX_LENGTH, message = "소개는 최대 200자입니다")
    private String bio;

    @Size(max = URL_MAX_LENGTH, message = "프로필 이미지 URL이 너무 깁니다")
    private String avatar;

    @Size(max = SOCIAL_LINK_MAX_COUNT, message = "소셜 링크가 너무 많습니다")
    private Map<
                    @NotBlank(message = "소셜 링크 종류가 필요합니다")
                    @Pattern(
                            regexp = "^(github|instagram|linkedin|website|twitter|threads)$",
                            message = "지원하지 않는 소셜 링크입니다")
                    String,
                    @NotBlank(message = "소셜 링크 URL이 필요합니다")
                    @Size(max = URL_MAX_LENGTH, message = "소셜 링크 URL이 너무 깁니다") String>
            socialLinks;

    @Size(max = TECH_STACK_MAX_COUNT, message = "기술 스택은 최대 30개입니다")
    private List<
                    @NotBlank(message = "기술 스택 이름이 필요합니다")
                    @Size(max = TECH_STACK_ITEM_MAX_LENGTH, message = "기술 스택 이름이 너무 깁니다") String>
            techStack;
}
