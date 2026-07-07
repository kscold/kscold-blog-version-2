package com.kscold.blog.identity.application.dto;

import java.util.List;
import java.util.Map;

public record UpdateProfileCommand(
        String displayName,
        String bio,
        String avatar,
        Map<String, String> socialLinks,
        List<String> techStack) {}
