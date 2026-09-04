package com.kscold.blog.payment.application.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import com.kscold.blog.payment.application.dto.command.PreparePaymentCommand;
import com.kscold.blog.payment.application.dto.response.PaymentConfigResponse;
import com.kscold.blog.payment.application.dto.response.PreparePaymentResponse;
import com.kscold.blog.payment.config.PortOnePaymentProperties;
import com.kscold.blog.payment.domain.model.PaymentOrder;
import com.kscold.blog.payment.domain.port.out.PaymentOrderRepository;
import com.kscold.blog.payment.domain.port.out.PortOnePaymentProvider;
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

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class AiAgentBloomPaymentApplicationServiceTest {

    @Mock private PaymentOrderRepository paymentOrderRepository;
    @Mock private PortOnePaymentProvider portOnePaymentProvider;

    private AiAgentBloomPaymentApplicationService service;

    @BeforeEach
    void setUp() {
        PortOnePaymentProperties properties = new PortOnePaymentProperties();
        properties.setStoreId("store-test");
        properties.setKakaoPayChannelKey("channel-key-kakao");

        service =
                new AiAgentBloomPaymentApplicationService(
                        paymentOrderRepository, properties, portOnePaymentProvider);

        when(paymentOrderRepository.save(any(PaymentOrder.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
    }

    private PreparePaymentCommand command() {
        return PreparePaymentCommand.builder()
                .customerName("테스트구매자")
                .customerEmail("buyer@example.com")
                .customerPhone("010-1234-5678")
                .build();
    }

    @Test
    @DisplayName("시나리오: 주문번호는 연속 생성해도 서로 겹치지 않는다")
    void paymentIdIsUnique() {
        Set<String> ids = new HashSet<>();
        for (int i = 0; i < 200; i++) {
            ids.add(service.prepare("user-1", command()).getPaymentId());
        }

        assertThat(ids).hasSize(200);
    }

    @Test
    @DisplayName("시나리오: 모든 주문은 카카오페이 채널과 간편결제로 준비된다")
    void paymentUsesKakaoPayOnly() {
        PreparePaymentResponse response = service.prepare("user-1", command());

        assertThat(response.getChannelKey()).isEqualTo("channel-key-kakao");
        assertThat(response.getPayMethod()).isEqualTo("EASY_PAY");
        assertThat(response.getEasyPayProvider()).isEqualTo("KAKAOPAY");
    }

    @Test
    @DisplayName("시나리오: 실결제 모드는 서버 설정값을 결제 화면에 전달한다")
    void livePaymentModeIsExposed() {
        PortOnePaymentProperties properties = new PortOnePaymentProperties();
        properties.setStoreId("store-live");
        properties.setKakaoPayChannelKey("channel-key-live");
        properties.setKakaoPayLiveEnabled(true);
        AiAgentBloomPaymentApplicationService liveService =
                new AiAgentBloomPaymentApplicationService(
                        paymentOrderRepository, properties, portOnePaymentProvider);

        PaymentConfigResponse response = liveService.getConfig();

        assertThat(response.isConfigured()).isTrue();
        assertThat(response.isLivePayment()).isTrue();
    }

    @Test
    @DisplayName("시나리오: 실결제 확인 상품은 1,000원 카카오페이 주문으로 준비된다")
    void liveTestPaymentUsesOneThousandWon() {
        PreparePaymentResponse response = service.prepareLiveTest("admin-1", command());

        assertThat(response.getProgramKey()).isEqualTo("kakaopay-live-test");
        assertThat(response.getTotalAmount()).isEqualTo(1_000);
        assertThat(response.getPayMethod()).isEqualTo("EASY_PAY");
        assertThat(response.getEasyPayProvider()).isEqualTo("KAKAOPAY");
    }
}
