package com.kscold.blog.stackshare.domain.port.out;

import com.kscold.blog.stackshare.domain.model.StackShareMessage;
import com.kscold.blog.stackshare.domain.model.StackShareSendResult;
import java.util.List;

public interface StackShareNotificationSender {

    StackShareSendResult send(List<StackShareMessage> messages);
}
