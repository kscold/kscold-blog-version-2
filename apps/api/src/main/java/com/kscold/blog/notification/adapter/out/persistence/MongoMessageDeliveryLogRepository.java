package com.kscold.blog.notification.adapter.out.persistence;

import com.kscold.blog.notification.domain.model.MessageDeliveryLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface MongoMessageDeliveryLogRepository
        extends MongoRepository<MessageDeliveryLog, String> {

    Page<MessageDeliveryLog> findAllByOrderByCreatedAtDesc(Pageable pageable);

    Page<MessageDeliveryLog> findByChannelOrderByCreatedAtDesc(
            MessageDeliveryLog.Channel channel, Pageable pageable);

    Page<MessageDeliveryLog> findByStatusOrderByCreatedAtDesc(
            MessageDeliveryLog.Status status, Pageable pageable);

    Page<MessageDeliveryLog> findByChannelAndStatusOrderByCreatedAtDesc(
            MessageDeliveryLog.Channel channel,
            MessageDeliveryLog.Status status,
            Pageable pageable);
}
