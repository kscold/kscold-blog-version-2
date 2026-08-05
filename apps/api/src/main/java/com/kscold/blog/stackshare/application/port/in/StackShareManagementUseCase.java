package com.kscold.blog.stackshare.application.port.in;

import com.kscold.blog.stackshare.application.dto.SaveStackShareParticipantCommand;
import com.kscold.blog.stackshare.application.dto.SendStackShareNotificationsCommand;
import com.kscold.blog.stackshare.domain.model.StackShareParticipant;
import com.kscold.blog.stackshare.domain.model.StackShareSendResult;
import com.kscold.blog.stackshare.domain.model.StackShareSettlement;
import java.util.List;

public interface StackShareManagementUseCase {

    List<StackShareParticipant> getParticipants();

    StackShareParticipant saveParticipant(SaveStackShareParticipantCommand command);

    void deleteParticipant(String id);

    List<StackShareSettlement> getSettlements();

    StackShareSendResult createAndSend(SendStackShareNotificationsCommand command);
}
