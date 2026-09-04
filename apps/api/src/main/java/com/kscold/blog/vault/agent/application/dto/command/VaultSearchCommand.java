package com.kscold.blog.vault.agent.application.dto.command;

public record VaultSearchCommand(String query, String activeFolderName, int limit) {}
