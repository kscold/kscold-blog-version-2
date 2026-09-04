package com.kscold.blog.notification.domain.port.out;

import com.kscold.blog.notification.domain.model.MessageDeliveryLog;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface MessageDeliveryLogRepository {

    MessageDeliveryLog save(MessageDeliveryLog log);

    List<MessageDeliveryLog> saveAll(List<MessageDeliveryLog> logs);

    /** 채널·상태로 걸러 최근 순으로. 둘 다 null 이면 전체를 준다. */
    Page<MessageDeliveryLog> search(
            MessageDeliveryLog.Channel channel,
            MessageDeliveryLog.Status status,
            Pageable pageable);
}
