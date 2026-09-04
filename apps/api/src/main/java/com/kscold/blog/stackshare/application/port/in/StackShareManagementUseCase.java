package com.kscold.blog.stackshare.application.port.in;

import com.kscold.blog.stackshare.application.dto.SaveStackShareAccountCommand;
import com.kscold.blog.stackshare.application.dto.SaveStackShareGroupCommand;
import com.kscold.blog.stackshare.application.dto.SaveStackShareParticipantCommand;
import com.kscold.blog.stackshare.application.dto.SendStackShareNotificationsCommand;
import com.kscold.blog.stackshare.domain.model.StackShareAccount;
import com.kscold.blog.stackshare.domain.model.StackShareGroup;
import com.kscold.blog.stackshare.domain.model.StackShareParticipant;
import com.kscold.blog.stackshare.domain.model.StackShareSendResult;
import com.kscold.blog.stackshare.domain.model.StackShareSettlement;
import java.util.List;

public interface StackShareManagementUseCase {

    /** 정산 알림톡에 실어 보낼 입금 계좌. 아직 등록 전이면 빈 계좌를 돌려준다. */
    StackShareAccount getAccount();

    StackShareAccount saveAccount(SaveStackShareAccountCommand command);

    List<StackShareParticipant> getParticipants();

    StackShareParticipant saveParticipant(SaveStackShareParticipantCommand command);

    void deleteParticipant(String id);

    /** 자주 함께 정산하는 사람 묶음. 정산할 때마다 같은 사람을 다시 고르지 않게 한다. */
    List<StackShareGroup> getGroups();

    StackShareGroup saveGroup(SaveStackShareGroupCommand command);

    void deleteGroup(String id);

    List<StackShareSettlement> getSettlements();

    StackShareSendResult createAndSend(SendStackShareNotificationsCommand command);
}
