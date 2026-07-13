package com.kscold.blog.identity.application.dto.command;

import java.util.List;
import java.util.Map;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class UpdateProfileCommand {
    private String displayName;
    private String bio;
    private String avatar;
    private Map<String, String> socialLinks;
    private List<String> techStack;
}
