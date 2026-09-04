package com.kscold.blog.stackshare.domain.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * 자주 함께 정산하는 사람 묶음. 예) "코덱스 그룹".
 *
 * <p>정산할 때마다 같은 사람을 다시 고르지 않도록 참여자 아이디를 담아둔다. 기본 서비스명과 본인 포함 여부까지 같이 기억해서 다음 정산을 한 번에 채운다.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "stack_share_groups")
public class StackShareGroup {

    @Id private String id;

    @Indexed(unique = true)
    private String name;

    /** 이 그룹으로 정산할 때 기본으로 채울 서비스명. 예) "Codex x20" */
    private String defaultToolName;

    /** 결제한 본인도 분담 인원에 넣을지. 정산 화면의 기본값으로 쓴다. */
    @Builder.Default private boolean includeOwner = true;

    /** 참여자 아이디 목록. 참여자가 지워지면 조회 시 걸러낸다. */
    @Builder.Default private List<String> participantIds = new ArrayList<>();

    @CreatedDate private LocalDateTime createdAt;
    @LastModifiedDate private LocalDateTime updatedAt;
}
