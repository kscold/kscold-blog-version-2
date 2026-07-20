package com.kscold.blog.payment.application.service;

import com.fasterxml.jackson.databind.JsonNode;
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
import com.kscold.blog.payment.domain.port.out.PaymentOrderRepository;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiAgentBloomPaymentApplicationService implements PaymentUseCase {

    private static final String PROGRAM_KEY = "ai-agent-bloom";
    private static final String PRODUCT_NAME = "AI Agent Bloom 참가권";
    private static final String ORDER_NAME = "AI Agent, 같이 만들고 피워보는 Bloom 참가권";
    private static final int TOTAL_AMOUNT = 30_000;
    private static final String CURRENCY = "KRW";
    private static final String PAY_METHOD_EASY_PAY = "EASY_PAY";
    private static final String PAY_METHOD_CARD = "CARD";
    private static final String EASY_PAY_PROVIDER = "KAKAOPAY";
    private static final String SERVICE_PERIOD = "결제 완료 즉시 참가권 확정, 상세 안내 1일 이내 이메일 제공";
    private static final DateTimeFormatter PAYMENT_ID_DATE =
            DateTimeFormatter.ofPattern("yyyyMMddHHmmss");

    /**
     * paymentId 접두어. KG이니시스는 주문번호(oid)를 최대 40자까지만 허용하는데, PROGRAM_KEY(ai-agent-bloom)를 그대로 쓰면 42자가
     * 되어 결제창이 열리지 않으므로 짧은 접두어를 따로 둔다.
     */
    private static final String PAYMENT_ID_PREFIX = "bloom";

    private final PaymentOrderRepository paymentOrderRepository;
    private final PortOnePaymentProperties portOnePaymentProperties;
    private final RestClient.Builder restClientBuilder;

    public PaymentConfigResponse getConfig() {
        return new PaymentConfigResponse(
                portOnePaymentProperties.isClientConfigured(),
                portOnePaymentProperties.isCardConfigured(),
                portOnePaymentProperties.getStoreId(),
                portOnePaymentProperties.getKakaoPayChannelKey(),
                PRODUCT_NAME,
                ORDER_NAME,
                TOTAL_AMOUNT,
                CURRENCY,
                SERVICE_PERIOD);
    }

    @Transactional
    public PreparePaymentResponse prepare(String userId, PreparePaymentCommand request) {
        String paymentAccessToken = normalizePaymentAccessToken(request.getPaymentAccessToken());
        boolean cardPayment = PAY_METHOD_CARD.equals(request.getPayMethod());

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

        String paymentId = createPaymentId();
        Instant now = Instant.now();
        PaymentOrder order =
                PaymentOrder.builder()
                        .paymentId(paymentId)
                        .userId(userId)
                        .paymentAccessToken(paymentAccessToken)
                        .programKey(PROGRAM_KEY)
                        .orderName(ORDER_NAME)
                        .totalAmount(TOTAL_AMOUNT)
                        .currency(CURRENCY)
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
                cardPayment
                        ? portOnePaymentProperties.getInicisChannelKey()
                        : portOnePaymentProperties.getKakaoPayChannelKey(),
                PROGRAM_KEY,
                PRODUCT_NAME,
                ORDER_NAME,
                TOTAL_AMOUNT,
                CURRENCY,
                cardPayment ? PAY_METHOD_CARD : PAY_METHOD_EASY_PAY,
                cardPayment ? null : EASY_PAY_PROVIDER,
                SERVICE_PERIOD,
                order.getCustomerName(),
                order.getCustomerEmail(),
                order.getCustomerPhone());
    }

    @Transactional
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

        JsonNode payment = fetchPortOnePayment(paymentId);
        String portOneStatus = payment.path("status").asText("");
        long paidAmount = resolvePaidAmount(payment);

        if (!"PAID".equals(portOneStatus)) {
            String message =
                    "결제가 완료되지 않았습니다. status="
                            + (portOneStatus.isBlank() ? "UNKNOWN" : portOneStatus);
            order.markFailed(portOneStatus, message);
            paymentOrderRepository.save(order);
            throw InvalidRequestException.invalidInput(message);
        }
        if (paidAmount != TOTAL_AMOUNT) {
            String message =
                    "결제 금액이 일치하지 않습니다. expected=%d, actual=%d".formatted(TOTAL_AMOUNT, paidAmount);
            order.markFailed(portOneStatus, message);
            paymentOrderRepository.save(order);
            throw InvalidRequestException.invalidInput(message);
        }

        order.markPaid(portOneStatus);
        paymentOrderRepository.save(order);
        return new CompletePaymentResponse(
                order.getPaymentId(), order.getStatus(), order.getPortOneStatus(), "결제가 확인되었습니다.");
    }

    private JsonNode fetchPortOnePayment(String paymentId) {
        try {
            JsonNode payment =
                    restClientBuilder
                            .baseUrl(portOnePaymentProperties.getApiBaseUrl())
                            .defaultHeader(
                                    HttpHeaders.AUTHORIZATION,
                                    "PortOne " + portOnePaymentProperties.getApiSecret())
                            .build()
                            .get()
                            .uri("/payments/{paymentId}", paymentId)
                            .retrieve()
                            .body(JsonNode.class);
            if (payment == null || payment.isMissingNode() || payment.isNull()) {
                throw new BusinessException(ErrorCode.EXTERNAL_API_ERROR, "포트원 결제 조회 결과가 비어 있습니다.");
            }
            return payment;
        } catch (RestClientResponseException exception) {
            log.warn(
                    "포트원 결제 조회 실패 paymentId={}, status={}",
                    paymentId,
                    exception.getStatusCode(),
                    exception);
            throw new BusinessException(ErrorCode.EXTERNAL_API_ERROR, "포트원 결제 조회에 실패했습니다.");
        } catch (Exception exception) {
            log.warn("포트원 결제 조회 중 예외 발생 paymentId={}", paymentId, exception);
            throw new BusinessException(ErrorCode.EXTERNAL_API_ERROR, "포트원 결제 조회 중 오류가 발생했습니다.");
        }
    }

    private long resolvePaidAmount(JsonNode payment) {
        JsonNode amount = payment.path("amount");
        if (amount.isObject()) {
            long total = amount.path("total").asLong(-1);
            if (total >= 0) {
                return total;
            }
            long totalAmount = amount.path("totalAmount").asLong(-1);
            if (totalAmount >= 0) {
                return totalAmount;
            }
        }
        long totalAmount = payment.path("totalAmount").asLong(-1);
        if (totalAmount >= 0) {
            return totalAmount;
        }
        return amount.asLong(-1);
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

    private String createPaymentId() {
        String timestamp = LocalDateTime.now().format(PAYMENT_ID_DATE);
        String suffix = UUID.randomUUID().toString().replace("-", "").substring(0, 12);
        // bloom(5) + -(1) + 타임스탬프(14) + -(1) + 랜덤(12) = 33자로 이니시스 제한(40자) 안에 들어감
        return PAYMENT_ID_PREFIX + "-" + timestamp + "-" + suffix;
    }
}
