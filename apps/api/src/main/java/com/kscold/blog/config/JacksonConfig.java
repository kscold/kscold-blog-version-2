package com.kscold.blog.config;

import com.fasterxml.jackson.databind.cfg.ConstructorDetector;
import org.springframework.boot.autoconfigure.jackson.Jackson2ObjectMapperBuilderCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class JacksonConfig {

    /**
     * 단일 인자 생성자를 delegating이 아니라 properties 기반으로 해석하게 한다.
     *
     * <p>{@code @AllArgsConstructor}로 통일한 단일 필드 요청 DTO(예: {@code {"path": "/vault"}} 형태)는, 인자가
     * 하나뿐이면 Jackson이 생성자를 delegating으로 오인해 객체 바인딩에 실패한다. {@code -parameters}로 파라미터명이 있으므로
     * properties 기반으로 강제하면 현재·향후 모든 단일 필드 DTO가 정상 역직렬화된다.
     */
    @Bean
    Jackson2ObjectMapperBuilderCustomizer propertiesBasedConstructorDetector() {
        return builder ->
                builder.postConfigurer(
                        mapper ->
                                mapper.setConstructorDetector(
                                        ConstructorDetector.USE_PROPERTIES_BASED));
    }
}
