package com.kscold.blog.adminnight.adapter.out.mail;

import com.kscold.blog.adminnight.domain.model.AdminNightProgramVote;
import java.util.List;

final class AdminNightProgramVoteLabels {

    private AdminNightProgramVoteLabels() {}

    static String resolveContactEmail(AdminNightProgramVote vote) {
        return fallbackText(vote.getContactEmail(), vote.getRequesterEmail());
    }

    static String describeInterestLevel(AdminNightProgramVote.InterestLevel interestLevel) {
        if (interestLevel == null) {
            return "미정";
        }
        return switch (interestLevel) {
            case CURIOUS -> "목차 보고 결정";
            case WANT_TO_ATTEND -> "듣고 싶어요";
            case READY_IF_SCHEDULE_FITS -> "일정 맞으면 참여";
        };
    }

    static String describePreferredFormat(AdminNightProgramVote.PreferredFormat preferredFormat) {
        if (preferredFormat == null) {
            return "미정";
        }
        return switch (preferredFormat) {
            case ONLINE -> "온라인";
            case OFFLINE -> "오프라인";
            case HYBRID -> "하이브리드";
            case FLEXIBLE -> "상관없음";
        };
    }

    static String describeSessionStyle(AdminNightProgramVote.SessionStyle sessionStyle) {
        if (sessionStyle == null) {
            return "섞어서";
        }
        return switch (sessionStyle) {
            case LECTURE -> "강의 중심";
            case WORKSHOP -> "실습 중심";
            case NETWORKING -> "네트워킹 중심";
            case MIXED -> "섞어서";
        };
    }

    static String describeSessionLength(AdminNightProgramVote.SessionLength sessionLength) {
        if (sessionLength == null) {
            return "2시간";
        }
        return switch (sessionLength) {
            case SHORT_90 -> "90분";
            case STANDARD_120 -> "2시간";
            case HALF_DAY -> "반나절";
            case SERIES -> "짧은 연속 세션";
        };
    }

    static String describeFoodPreference(AdminNightProgramVote.FoodPreference foodPreference) {
        if (foodPreference == null) {
            return "가벼운 간식";
        }
        return switch (foodPreference) {
            case NO_NEED -> "없어도 됨";
            case DRINKS_ONLY -> "음료 정도";
            case LIGHT_SNACK -> "가벼운 간식";
            case MEAL -> "식사도 원함";
        };
    }

    static String describePreferredDays(List<AdminNightProgramVote.PreferredDay> preferredDays) {
        if (preferredDays == null || preferredDays.isEmpty()) {
            return "토요일, 일요일";
        }
        return String.join(
                ", ",
                preferredDays.stream().map(AdminNightProgramVoteLabels::describeDay).toList());
    }

    private static String describeDay(AdminNightProgramVote.PreferredDay preferredDay) {
        if (preferredDay == null) {
            return "미정";
        }
        return switch (preferredDay) {
            case FRIDAY -> "금요일";
            case SATURDAY -> "토요일";
            case SUNDAY -> "일요일";
        };
    }

    static String describePreferredTimes(List<String> preferredTimes) {
        if (preferredTimes == null || preferredTimes.isEmpty()) {
            return "미정";
        }
        return String.join(
                ", ",
                preferredTimes.stream().map(AdminNightProgramVoteLabels::describeTime).toList());
    }

    private static String describeTime(String preferredTime) {
        if (preferredTime == null) {
            return "미정";
        }
        return switch (preferredTime) {
            case "weekday-night" -> "평일 저녁";
            case "friday-night" -> "금요일 밤";
            case "weekend-day" -> "주말 낮";
            case "weekend-night" -> "주말 저녁";
            default -> preferredTime;
        };
    }

    static String describeInterestedTopics(List<String> interestedTopics) {
        if (interestedTopics == null || interestedTopics.isEmpty()) {
            return "미정";
        }
        return String.join(
                ", ",
                interestedTopics.stream().map(AdminNightProgramVoteLabels::describeTopic).toList());
    }

    private static String describeTopic(String interestedTopic) {
        if (interestedTopic == null) {
            return "미정";
        }
        return switch (interestedTopic) {
            case "agent-methodology" -> "Agent 설계 방법론";
            case "langgraph-workflow" -> "LangGraph 워크플로우";
            case "tool-rag-memory" -> "Tool · RAG · Memory";
            case "evaluation-observability" -> "평가와 관측";
            case "production-ops" -> "실전 적용";
            default -> interestedTopic;
        };
    }

    static String fallbackText(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }
}
