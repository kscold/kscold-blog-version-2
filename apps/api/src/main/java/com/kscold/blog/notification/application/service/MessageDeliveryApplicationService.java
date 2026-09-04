package com.kscold.blog.notification.application.service;

import com.kscold.blog.notification.application.port.in.MessageDeliveryUseCase;
import com.kscold.blog.notification.domain.model.MessageDeliveryLog;
import com.kscold.blog.notification.domain.model.MessageDeliveryStatus;
import com.kscold.blog.notification.domain.port.out.MessageDeliveryLogRepository;
import com.kscold.blog.notification.domain.port.out.MessageDeliveryStatusPort;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class MessageDeliveryApplicationService implements MessageDeliveryUseCase {

    private final MessageDeliveryLogRepository logRepository;
    private final MessageDeliveryStatusPort statusPort;

    /** 기록은 부수적인 일이라, 여기서 실패해도 알림 발송 자체를 되돌리지 않는다. */
    @Override
    public void record(MessageDeliveryLog deliveryLog) {
        try {
            logRepository.save(deliveryLog);
        } catch (RuntimeException exception) {
            log.warn("알림 발송 기록 실패 recipient={}", deliveryLog.getRecipient(), exception);
        }
    }

    @Override
    public void recordAll(List<MessageDeliveryLog> logs) {
        if (logs == null || logs.isEmpty()) return;
        try {
            logRepository.saveAll(logs);
        } catch (RuntimeException exception) {
            log.warn("알림 발송 기록 실패 count={}", logs.size(), exception);
        }
    }

    @Override
    public Page<MessageDeliveryLog> search(
            MessageDeliveryLog.Channel channel,
            MessageDeliveryLog.Status status,
            Pageable pageable) {
        return logRepository.search(channel, status, pageable);
    }

    @Override
    public List<MessageDeliveryStatus> getProviderStatus(String providerGroupId) {
        if (providerGroupId == null || providerGroupId.isBlank()) return List.of();
        return statusPort.findByGroupId(providerGroupId);
    }
}
