package com.kscold.blog.payment.application.service;

import com.kscold.blog.exception.BusinessException;
import com.kscold.blog.exception.ErrorCode;
import com.kscold.blog.exception.InvalidRequestException;
import com.kscold.blog.payment.application.dto.command.PreparePaymentCommand;
import com.kscold.blog.payment.application.dto.response.CompletePaymentResponse;
import com.kscold.blog.payment.application.dto.response.PaymentConfigResponse;
import com.kscold.blog.payment.application.dto.response.PreparePaymentResponse;
import com.kscold.blog.payment.application.port.in.PaymentUseCase;
import com.kscold.blog.payment.config.PortOnePaymentProperties;
import com.kscold.blog.payment.domain.model.PaymentOrder;
import com.kscold.blog.payment.domain.model.PaymentOrderStatus;
import com.kscold.blog.payment.domain.model.PaymentProduct;
import com.kscold.blog.payment.domain.model.PortOnePaymentDetails;
import com.kscold.blog.payment.domain.port.out.PaymentOrderRepository;
import com.kscold.blog.payment.domain.port.out.PortOnePaymentProvider;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AiAgentBloomPaymentApplicationService implements PaymentUseCase {

    private static final String PAY_METHOD_EASY_PAY = "EASY_PAY";
    private static final String PAY_METHOD_CARD = "CARD";
    private static final String EASY_PAY_PROVIDER = "KAKAOPAY";
    private static final DateTimeFormatter PAYMENT_ID_DATE =
            DateTimeFormatter.ofPattern("yyyyMMddHHmmss");

    private final PaymentOrderRepository paymentOrderRepository;
    private final PortOnePaymentProperties portOnePaymentProperties;
    private final PortOnePaymentProvider portOnePaymentProvider;

    @Override
    public PaymentConfigResponse getConfig() {
        return getConfig(PaymentProduct.AI_AGENT_BLOOM);
    }

    @Override
    public PaymentConfigResponse getLiveTestConfig() {
        return getConfig(PaymentProduct.KAKAO_PAY_LIVE_TEST);
    }

    private PaymentConfigResponse getConfig(PaymentProduct product) {
        return new PaymentConfigResponse(
                portOnePaymentProperties.isClientConfigured(),
                portOnePaymentProperties.isKakaoPayLiveEnabled(),
                portOnePaymentProperties.isCardConfigured(),
                portOnePaymentProperties.getStoreId(),
                portOnePaymentProperties.getKakaoPayChannelKey(),
                product.getProductName(),
                product.getOrderName(),
                product.getTotalAmount(),
                product.getCurrency(),
                product.getServicePeriod());
    }

    @Transactional
    @Override
    public PreparePaymentResponse prepare(String userId, PreparePaymentCommand request) {
        return prepare(userId, request, PaymentProduct.AI_AGENT_BLOOM, true);
    }

    @Transactional
    @Override
    public PreparePaymentResponse prepareLiveTest(String userId, PreparePaymentCommand request) {
        return prepare(userId, request, PaymentProduct.KAKAO_PAY_LIVE_TEST, false);
    }

    private PreparePaymentResponse prepare(
            String userId,
            PreparePaymentCommand request,
            PaymentProduct product,
            boolean cardPaymentAllowed) {
        String paymentAccessToken = normalizePaymentAccessToken(request.getPaymentAccessToken());
        boolean cardPayment = PAY_METHOD_CARD.equals(request.getPayMethod());

        if (cardPayment && !cardPaymentAllowed) {
            throw InvalidRequestException.invalidInput("카카오페이 실결제 확인 상품은 카카오페이만 지원합니다.");
        }

        // 신용카드(KG이니시스) 경로는 비회원 구매를 허용함. 카드 결제창까지 로그인 없이 도달할 수 있어야 하기 때문.
        if (!cardPayment && (userId == null || userId.isBlank()) && paymentAccessToken == null) {
            throw new BusinessException(
                    ErrorCode.UNAUTHORIZED, "로그인하거나 안내받은 결제 링크로 접속해야 결제할 수 있습니다.");
        }
        if (cardPayment && !portOnePaymentProperties.isCardConfigured()) {
            throw InvalidRequestException.invalidInput(
                    "PORTONE_STORE_ID와 PORTONE_INICIS_CHANNEL_KEY 설정 후 신용카드 결제창을 열 수 있습니다.");
        }
        if (!cardPayment && !portOnePaymentProperties.isClientConfigured()) {
            throw InvalidRequestException.invalidInput(
                    "PORTONE_STORE_ID와 PORTONE_KAKAOPAY_CHANNEL_KEY 설정 후 결제창을 열 수 있습니다.");
        }

        String paymentId = createPaymentId(product.getPaymentIdPrefix());
        String channelKey =
                cardPayment
                        ? portOnePaymentProperties.getInicisChannelKey()
                        : portOnePaymentProperties.getKakaoPayChannelKey();
        Instant now = Instant.now();
        PaymentOrder order =
                PaymentOrder.builder()
                        .paymentId(paymentId)
                        .userId(userId)
                        .paymentAccessToken(paymentAccessToken)
                        .programKey(product.getProgramKey())
                        .orderName(product.getOrderName())
                        .totalAmount(product.getTotalAmount())
                        .currency(product.getCurrency())
                        .payMethod(cardPayment ? PAY_METHOD_CARD : PAY_METHOD_EASY_PAY)
                        .expectedChannelKey(channelKey)
                        .customerName(request.getCustomerName().trim())
                        .customerEmail(request.getCustomerEmail().trim())
                        .customerPhone(request.getCustomerPhone().trim())
                        .status(PaymentOrderStatus.READY)
                        .createdAt(now)
                        .updatedAt(now)
                        .build();

        paymentOrderRepository.save(order);

        return new PreparePaymentResponse(
                paymentId,
                portOnePaymentProperties.getStoreId(),
                channelKey,
                product.getProgramKey(),
                product.getProductName(),
                product.getOrderName(),
                product.getTotalAmount(),
                product.getCurrency(),
                cardPayment ? PAY_METHOD_CARD : PAY_METHOD_EASY_PAY,
                cardPayment ? null : EASY_PAY_PROVIDER,
                product.getServicePeriod(),
                order.getCustomerName(),
                order.getCustomerEmail(),
                order.getCustomerPhone());
    }

    @Transactional
    @Override
    public CompletePaymentResponse complete(
            String userId, String paymentId, String requestPaymentAccessToken) {
        String paymentAccessToken = normalizePaymentAccessToken(requestPaymentAccessToken);
        if (!portOnePaymentProperties.isServerConfigured()) {
            throw InvalidRequestException.invalidInput(
                    "PORTONE_API_SECRET 설정 후 결제 검증을 완료할 수 있습니다.");
        }

        PaymentOrder order =
                paymentOrderRepository
                        .findByPaymentId(paymentId)
                        .orElseThrow(
                                () -> InvalidRequestException.invalidInput("등록되지 않은 결제 ID입니다."));
        if (!canAccessOrder(userId, paymentAccessToken, order)) {
            throw new BusinessException(
                    ErrorCode.FORBIDDEN, "본인의 결제 건 또는 안내받은 결제 링크로만 확인할 수 있습니다.");
        }
        if (order.getStatus() == PaymentOrderStatus.PAID) {
            return new CompletePaymentResponse(
                    order.getPaymentId(),
                    order.getStatus(),
                    order.getPortOneStatus(),
                    "이미 결제가 확인되었습니다.");
        }

        PortOnePaymentDetails payment = portOnePaymentProvider.getPayment(paymentId);
        String portOneStatus = payment.status();

        if (!"PAID".equals(portOneStatus)) {
            String message =
                    "결제가 완료되지 않았습니다. status="
                            + (portOneStatus.isBlank() ? "UNKNOWN" : portOneStatus);
            order.markFailed(portOneStatus, message);
            paymentOrderRepository.save(order);
            throw InvalidRequestException.invalidInput(message);
        }
        if (payment.paidAmount() != order.getTotalAmount()) {
            String message =
                    "결제 금액이 일치하지 않습니다. expected=%d, actual=%d"
                            .formatted(order.getTotalAmount(), payment.paidAmount());
            order.markFailed(portOneStatus, message);
            paymentOrderRepository.save(order);
            throw InvalidRequestException.invalidInput(message);
        }
        validateLiveChannel(payment, portOneStatus, order);

        order.markPaid(portOneStatus);
        paymentOrderRepository.save(order);
        return new CompletePaymentResponse(
                order.getPaymentId(), order.getStatus(), order.getPortOneStatus(), "결제가 확인되었습니다.");
    }

    /**
     * 실결제 모드에서는 포트원이 실제 운영 채널로 승인한 결제만 최종 완료 처리한다.
     *
     * <p>브라우저가 전달하는 성공 응답은 위변조될 수 있으므로 서버가 조회한 결제의 채널 유형과 채널 키를 함께 확인한다. 이 검증으로 운영 화면에서 테스트 채널 결제가
     * 실결제로 기록되는 상황과 다른 상점 채널의 결제가 섞이는 상황을 막는다.
     */
    private void validateLiveChannel(
            PortOnePaymentDetails payment, String portOneStatus, PaymentOrder order) {
        if (!portOnePaymentProperties.isKakaoPayLiveEnabled()) {
            return;
        }

        String expectedChannelKey = order.getExpectedChannelKey();
        if (expectedChannelKey == null || expectedChannelKey.isBlank()) {
            expectedChannelKey = portOnePaymentProperties.getKakaoPayChannelKey();
        }
        boolean liveKakaoPayChannel =
                "LIVE".equals(payment.channelType())
                        && expectedChannelKey.equals(payment.channelKey());
        if (liveKakaoPayChannel) {
            return;
        }

        String message = "주문에 설정된 실연동 채널로 승인된 결제가 아닙니다.";
        order.markFailed(portOneStatus, message);
        paymentOrderRepository.save(order);
        throw InvalidRequestException.invalidInput(message);
    }

    private boolean canAccessOrder(String userId, String paymentAccessToken, PaymentOrder order) {
        if (userId != null && !userId.isBlank() && userId.equals(order.getUserId())) {
            return true;
        }
        if (paymentAccessToken != null
                && paymentAccessToken.equals(order.getPaymentAccessToken())) {
            return true;
        }
        // 비회원 주문(소유자·토큰 없음)은 추측 불가능한 서버 발급 paymentId 로만 접근하고,
        // 실제 결제 여부는 포트원 조회로 재검증하므로 결제 확인을 허용함.
        return isGuestOrder(order);
    }

    private boolean isGuestOrder(PaymentOrder order) {
        return (order.getUserId() == null || order.getUserId().isBlank())
                && (order.getPaymentAccessToken() == null
                        || order.getPaymentAccessToken().isBlank());
    }

    private String normalizePaymentAccessToken(String paymentAccessToken) {
        if (paymentAccessToken == null || paymentAccessToken.isBlank()) {
            return null;
        }
        return paymentAccessToken.trim();
    }

    private String createPaymentId(String prefix) {
        String timestamp = LocalDateTime.now().format(PAYMENT_ID_DATE);
        String suffix = UUID.randomUUID().toString().replace("-", "").substring(0, 12);
        return prefix + "-" + timestamp + "-" + suffix;
    }
}
