package com.kscold.blog.adminnight.domain.port.out;

import com.kscold.blog.adminnight.domain.model.AdminNightProgramVote;
import com.kscold.blog.notification.domain.model.MailMessage;

/** AI Agent Bloom 프로그램 투표 메일을 조립한다. */
public interface AdminNightProgramVoteMailComposer {

    MailMessage buildProgramVoteThanks(AdminNightProgramVote vote);

    MailMessage buildProgramVoteNotification(AdminNightProgramVote vote, String adminEmail);
}
