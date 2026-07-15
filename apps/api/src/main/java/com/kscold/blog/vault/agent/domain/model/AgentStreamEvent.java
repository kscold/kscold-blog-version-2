package com.kscold.blog.vault.agent.domain.model;

public record AgentStreamEvent(
        Type type, AgentChatStage stage, String delta, AgentChatResult result) {

    public enum Type {
        STAGE,
        DELTA,
        COMPLETED
    }

    public static AgentStreamEvent stage(AgentChatStage stage) {
        return new AgentStreamEvent(Type.STAGE, stage, "", null);
    }

    public static AgentStreamEvent delta(String delta) {
        return new AgentStreamEvent(Type.DELTA, null, delta, null);
    }

    public static AgentStreamEvent completed(AgentChatResult result) {
        return new AgentStreamEvent(Type.COMPLETED, null, "", result);
    }
}
