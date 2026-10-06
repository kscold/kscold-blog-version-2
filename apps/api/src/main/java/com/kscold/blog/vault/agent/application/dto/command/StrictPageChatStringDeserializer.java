package com.kscold.blog.vault.agent.application.dto.command;

import tools.jackson.core.JsonParser;
import tools.jackson.core.JsonToken;
import tools.jackson.databind.DatabindException;
import tools.jackson.databind.DeserializationContext;
import tools.jackson.databind.deser.std.StdScalarDeserializer;

/** 숫자·불리언을 문자열로 암묵 변환하지 않고 페이지 계약의 자료형을 고정한다. */
public final class StrictPageChatStringDeserializer extends StdScalarDeserializer<String> {
    public StrictPageChatStringDeserializer() {
        super(String.class);
    }

    @Override
    public String deserialize(JsonParser parser, DeserializationContext context) {
        if (parser.currentToken() != JsonToken.VALUE_STRING) {
            throw DatabindException.from(parser, "페이지 질문 자료에는 문자열이 필요합니다.");
        }
        return parser.getString();
    }
}
