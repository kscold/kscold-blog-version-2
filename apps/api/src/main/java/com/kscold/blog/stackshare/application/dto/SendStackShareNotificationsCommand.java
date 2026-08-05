package com.kscold.blog.stackshare.application.dto;

import java.util.List;

public record SendStackShareNotificationsCommand(
        StackShareSettlementCommand settlement, List<StackShareRecipientCommand> recipients) {}
