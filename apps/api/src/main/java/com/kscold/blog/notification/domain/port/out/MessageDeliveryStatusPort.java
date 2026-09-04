package com.kscold.blog.notification.domain.port.out;

import com.kscold.blog.notification.domain.model.MessageDeliveryStatus;
import java.util.List;

/** 보낸 알림톡이 실제로 도착했는지 공급자에게 물어본다. */
public interface MessageDeliveryStatusPort {

    /** 발송 그룹 하나에 속한 메시지들의 실제 도달 상태. 조회할 수 없으면 빈 목록. */
    List<MessageDeliveryStatus> findByGroupId(String groupId);
}
