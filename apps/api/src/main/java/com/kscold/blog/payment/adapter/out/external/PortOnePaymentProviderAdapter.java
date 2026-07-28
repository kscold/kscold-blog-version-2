package com.kscold.blog.payment.adapter.out.external;

import com.fasterxml.jackson.databind.JsonNode;
import com.kscold.blog.exception.BusinessException;
import com.kscold.blog.exception.ErrorCode;
import com.kscold.blog.payment.config.PortOnePaymentProperties;
import com.kscold.blog.payment.domain.model.PortOnePaymentDetails;
import com.kscold.blog.payment.domain.port.out.PortOnePaymentProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

@Slf4j
@Component
@RequiredArgsConstructor
public class PortOnePaymentProviderAdapter implements PortOnePaymentProvider {

    private final PortOnePaymentProperties properties;
    private final RestClient.Builder restClientBuilder;

    @Override
    public PortOnePaymentDetails getPayment(String paymentId) {
        JsonNode payment = fetchPayment(paymentId);
        JsonNode selectedChannel = payment.path("selectedChannel");
        return new PortOnePaymentDetails(
                payment.path("status").asText(""),
                resolvePaidAmount(payment),
                selectedChannel.path("type").asText(""),
                selectedChannel.path("key").asText(""));
    }

    private JsonNode fetchPayment(String paymentId) {
        try {
            JsonNode payment =
                    restClientBuilder
                            .baseUrl(properties.getApiBaseUrl())
                            .defaultHeader(
                                    HttpHeaders.AUTHORIZATION,
                                    "PortOne " + properties.getApiSecret())
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
        } catch (BusinessException exception) {
            throw exception;
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
        return totalAmount >= 0 ? totalAmount : amount.asLong(-1);
    }
}
