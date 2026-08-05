package com.kscold.blog.stackshare.adapter.in.web.dto.response;

import com.kscold.blog.stackshare.domain.model.StackShareParticipant;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StackShareParticipantResponse {

    private String id;
    private String name;
    private String phoneNumber;
    private String email;
    private String userId;

    public static StackShareParticipantResponse from(StackShareParticipant participant) {
        return StackShareParticipantResponse.builder()
                .id(participant.getId())
                .name(participant.getName())
                .phoneNumber(participant.getPhoneNumber())
                .email(participant.getEmail())
                .userId(participant.getUserId())
                .build();
    }
}
