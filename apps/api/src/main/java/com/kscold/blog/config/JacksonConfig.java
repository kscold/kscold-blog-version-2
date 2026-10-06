package com.kscold.blog.config;

import org.springframework.boot.jackson.autoconfigure.JsonMapperBuilderCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import tools.jackson.databind.MapperFeature;
import tools.jackson.databind.cfg.ConstructorDetector;

@Configuration
public class JacksonConfig {

    /**
     * 요청 DTO를 생성자로 역직렬화하게 함.
     *
     * <p>요청 DTO는 기본 생성자 없이 {@code @AllArgsConstructor}만 두므로, Jackson이 생성자 파라미터 이름({@code
     * -parameters}로 컴파일)을 읽어 JSON 필드와 맞춰야 객체를 만들 수 있다. {@code
     * spring.jackson.use-jackson2-defaults}는 Jackson 2의 순정 기본값을 따라 이 탐지를 꺼 두기 때문에 여기서 다시 켠다. 켜지 않으면
     * 본문이 있는 모든 요청이 500으로 끝난다.
     *
     * <p>인자가 하나뿐인 생성자는 Jackson이 delegating으로 오인해 {@code {"path": "/vault"}} 같은 본문의 바인딩에 실패하므로,
     * properties 기반으로 해석하도록 고정한다.
     */
    @Bean
    JsonMapperBuilderCustomizer constructorBasedRequestBinding() {
        return builder ->
                builder.enable(MapperFeature.DETECT_PARAMETER_NAMES)
                        .constructorDetector(ConstructorDetector.USE_PROPERTIES_BASED);
    }
}
