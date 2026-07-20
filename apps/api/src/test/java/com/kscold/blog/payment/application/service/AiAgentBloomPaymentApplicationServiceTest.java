package com.kscold.blog.payment.application.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import com.kscold.blog.payment.application.dto.command.PreparePaymentCommand;
import com.kscold.blog.payment.application.dto.response.PreparePaymentResponse;
import com.kscold.blog.payment.config.PortOnePaymentProperties;
import com.kscold.blog.payment.domain.model.PaymentOrder;
import com.kscold.blog.payment.domain.port.out.PaymentOrderRepository;
import java.util.HashSet;
import java.util.Set;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.web.client.RestClient;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class AiAgentBloomPaymentApplicationServiceTest {

    /** KG이니시스 주문번호(oid) 최대 길이. 넘기면 결제창이 Dev. Error 로 거부함. */
    private static final int INICIS_OID_MAX_LENGTH = 40;

    @Mock private PaymentOrderRepository paymentOrderRepository;
    @Mock private RestClient.Builder restClientBuilder;

    private AiAgentBloomPaymentApplicationService service;

    @BeforeEach
    void setUp() {
        PortOnePaymentProperties properties = new PortOnePaymentProperties();
        properties.setStoreId("store-test");
        properties.setKakaoPayChannelKey("channel-key-kakao");
        properties.setInicisChannelKey("channel-key-inicis");

        service =
                new AiAgentBloomPaymentApplicationService(
                        paymentOrderRepository, properties, restClientBuilder);

        when(paymentOrderRepository.save(any(PaymentOrder.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
    }

    private PreparePaymentCommand command(String payMethod) {
        return PreparePaymentCommand.builder()
                .customerName("테스트구매자")
                .customerEmail("buyer@example.com")
                .customerPhone("010-1234-5678")
                .payMethod(payMethod)
                .build();
    }

    @Test
    @DisplayName("시나리오: 카드 결제용 주문번호는 KG이니시스 제한(40자)을 넘지 않는다")
    void paymentIdFitsInicisOidLimit() {
        PreparePaymentResponse response = service.prepare(null, command("CARD"));

        assertThat(response.getPaymentId()).hasSizeLessThanOrEqualTo(INICIS_OID_MAX_LENGTH);
    }

    @Test
    @DisplayName("시나리오: 주문번호는 연속 생성해도 서로 겹치지 않는다")
    void paymentIdIsUnique() {
        Set<String> ids = new HashSet<>();
        for (int i = 0; i < 200; i++) {
            ids.add(service.prepare(null, command("CARD")).getPaymentId());
        }

        assertThat(ids).hasSize(200);
    }

    @Test
    @DisplayName("시나리오: CARD 는 이니시스 채널키와 CARD 결제수단으로 준비된다")
    void cardPaymentUsesInicisChannel() {
        PreparePaymentResponse response = service.prepare(null, command("CARD"));

        assertThat(response.getChannelKey()).isEqualTo("channel-key-inicis");
        assertThat(response.getPayMethod()).isEqualTo("CARD");
        assertThat(response.getEasyPayProvider()).isNull();
    }

    @Test
    @DisplayName("시나리오: EASY_PAY 는 카카오페이 채널키와 간편결제로 준비된다")
    void easyPayUsesKakaoChannel() {
        PreparePaymentResponse response = service.prepare("user-1", command("EASY_PAY"));

        assertThat(response.getChannelKey()).isEqualTo("channel-key-kakao");
        assertThat(response.getPayMethod()).isEqualTo("EASY_PAY");
        assertThat(response.getEasyPayProvider()).isEqualTo("KAKAOPAY");
    }
}
