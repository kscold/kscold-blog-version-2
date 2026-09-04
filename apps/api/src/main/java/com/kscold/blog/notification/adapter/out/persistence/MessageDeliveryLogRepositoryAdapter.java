package com.kscold.blog.notification.adapter.out.persistence;

import com.kscold.blog.notification.domain.model.MessageDeliveryLog;
import com.kscold.blog.notification.domain.port.out.MessageDeliveryLogRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

@SuppressWarnings("null")
@Component
@RequiredArgsConstructor
public class MessageDeliveryLogRepositoryAdapter implements MessageDeliveryLogRepository {

    private final MongoMessageDeliveryLogRepository repository;

    @Override
    public MessageDeliveryLog save(MessageDeliveryLog log) {
        return repository.save(log);
    }

    @Override
    public List<MessageDeliveryLog> saveAll(List<MessageDeliveryLog> logs) {
        return repository.saveAll(logs);
    }

    @Override
    public Page<MessageDeliveryLog> search(
            MessageDeliveryLog.Channel channel,
            MessageDeliveryLog.Status status,
            Pageable pageable) {
        if (channel != null && status != null) {
            return repository.findByChannelAndStatusOrderByCreatedAtDesc(channel, status, pageable);
        }
        if (channel != null) {
            return repository.findByChannelOrderByCreatedAtDesc(channel, pageable);
        }
        if (status != null) {
            return repository.findByStatusOrderByCreatedAtDesc(status, pageable);
        }
        return repository.findAllByOrderByCreatedAtDesc(pageable);
    }
}
