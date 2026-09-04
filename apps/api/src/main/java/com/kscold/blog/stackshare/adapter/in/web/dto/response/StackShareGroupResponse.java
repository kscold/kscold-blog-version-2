package com.kscold.blog.stackshare.adapter.in.web.dto.response;

import com.kscold.blog.stackshare.domain.model.StackShareGroup;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StackShareGroupResponse {

    private String id;
    private String name;
    private String defaultToolName;
    private boolean includeOwner;
    private List<String> participantIds;

    public static StackShareGroupResponse from(StackShareGroup group) {
        return StackShareGroupResponse.builder()
                .id(group.getId())
                .name(group.getName())
                .defaultToolName(group.getDefaultToolName())
                .includeOwner(group.isIncludeOwner())
                .participantIds(group.getParticipantIds())
                .build();
    }
}
