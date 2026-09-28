package com.kscold.blog.vault.agent.application.dto.command;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.JsonToken;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.deser.std.StdScalarDeserializer;
import java.io.IOException;

/** 숫자·불리언을 문자열로 암묵 변환하지 않고 페이지 계약의 자료형을 고정한다. */
public final class StrictPageChatStringDeserializer extends StdScalarDeserializer<String> {
    public StrictPageChatStringDeserializer() {
        super(String.class);
    }

    @Override
    public String deserialize(JsonParser parser, DeserializationContext context)
            throws IOException {
        if (parser.currentToken() != JsonToken.VALUE_STRING) {
            throw JsonMappingException.from(parser, "페이지 질문 자료에는 문자열이 필요합니다.");
        }
        return parser.getText();
    }
}
