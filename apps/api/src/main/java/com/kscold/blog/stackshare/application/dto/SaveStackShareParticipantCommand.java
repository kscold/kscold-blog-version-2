package com.kscold.blog.stackshare.application.dto;

public record SaveStackShareParticipantCommand(
        String id, String name, String phoneNumber, String email, String userId) {}
