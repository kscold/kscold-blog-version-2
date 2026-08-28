package com.kscold.blog.stackshare.application.dto;

public record SaveStackShareAccountCommand(
        String bankName, String accountNumber, String accountHolder) {}
