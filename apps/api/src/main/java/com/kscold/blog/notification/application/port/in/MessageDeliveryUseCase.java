package com.kscold.blog.notification.application.port.in;

import com.kscold.blog.notification.domain.model.MessageDeliveryLog;
import com.kscold.blog.notification.domain.model.MessageDeliveryStatus;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/** 밖으로 나간 알림을 기록하고, 실제로 도착했는지 확인한다. */
public interface MessageDeliveryUseCase {

    /** 알림 한 건을 기록한다. 기록에 실패해도 원래 발송은 막지 않는다. */
    void record(MessageDeliveryLog log);

    void recordAll(List<MessageDeliveryLog> logs);

    Page<MessageDeliveryLog> search(
            MessageDeliveryLog.Channel channel,
            MessageDeliveryLog.Status status,
            Pageable pageable);

    /** 공급자에게 실제 도달 상태를 물어본다. 알림톡만 조회할 수 있다. */
    List<MessageDeliveryStatus> getProviderStatus(String providerGroupId);
}
