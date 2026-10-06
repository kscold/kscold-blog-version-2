package com.kscold.blog.support;

import tools.jackson.databind.MapperFeature;
import tools.jackson.databind.json.JsonMapper;

/** 테스트에서 쓰는 JSON 매퍼. 운영 설정처럼 Jackson 2 시절의 기본 동작에 생성자 파라미터 이름 탐지를 더한다. */
public final class TestJson {

    private TestJson() {}

    public static JsonMapper mapper() {
        return JsonMapper.builderWithJackson2Defaults()
                .enable(MapperFeature.DETECT_PARAMETER_NAMES)
                .build();
    }
}
