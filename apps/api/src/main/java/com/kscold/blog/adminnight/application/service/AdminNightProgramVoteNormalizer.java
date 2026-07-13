package com.kscold.blog.adminnight.application.service;

import com.kscold.blog.adminnight.domain.model.AdminNightProgramVote;
import com.kscold.blog.exception.InvalidRequestException;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.regex.Pattern;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
public class AdminNightProgramVoteNormalizer {

    private static final Pattern PROGRAM_KEY_PATTERN = Pattern.compile("^[a-z0-9][a-z0-9-]{1,80}$");
    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$");
    private static final Pattern REQUESTER_NAME_PATTERN =
            Pattern.compile("^[가-힣A-Za-z][가-힣A-Za-z\\s·.-]{1,39}$");
    private static final Pattern PHONE_DIGITS_PATTERN =
            Pattern.compile("^(01[016789]\\d{7,8}|02\\d{7,8}|0[3-9]\\d{8,9})$");

    public String normalizeProgramKey(String programKey) {
        if (!StringUtils.hasText(programKey)
                || !PROGRAM_KEY_PATTERN.matcher(programKey).matches()) {
            throw InvalidRequestException.invalidInput("프로그램 키가 올바르지 않습니다.");
        }
        return programKey.trim().toLowerCase();
    }

    public AdminNightProgramVote.InterestLevel requireInterestLevel(
            AdminNightProgramVote.InterestLevel interestLevel) {
        if (interestLevel == null) {
            throw InvalidRequestException.invalidInput("참여 의향을 골라주세요.");
        }
        return interestLevel;
    }

    public AdminNightProgramVote.PreferredFormat requirePreferredFormat(
            AdminNightProgramVote.PreferredFormat preferredFormat) {
        if (preferredFormat == null) {
            throw InvalidRequestException.invalidInput("선호 진행 방식을 골라주세요.");
        }
        return preferredFormat;
    }

    public AdminNightProgramVote.ExperienceLevel requireExperienceLevel(
            AdminNightProgramVote.ExperienceLevel experienceLevel) {
        if (experienceLevel == null) {
            throw InvalidRequestException.invalidInput("현재 경험 수준을 골라주세요.");
        }
        return experienceLevel;
    }

    public AdminNightProgramVote.SessionStyle requireSessionStyle(
            AdminNightProgramVote.SessionStyle sessionStyle) {
        if (sessionStyle == null) {
            throw InvalidRequestException.invalidInput("선호 Bloom 형식을 골라주세요.");
        }
        return sessionStyle;
    }

    public AdminNightProgramVote.SessionLength requireSessionLength(
            AdminNightProgramVote.SessionLength sessionLength) {
        if (sessionLength == null) {
            throw InvalidRequestException.invalidInput("좋은 Bloom 시간을 골라주세요.");
        }
        return sessionLength;
    }

    public AdminNightProgramVote.FoodPreference requireFoodPreference(
            AdminNightProgramVote.FoodPreference foodPreference) {
        if (foodPreference == null) {
            throw InvalidRequestException.invalidInput("음식/음료 선호를 골라주세요.");
        }
        return foodPreference;
    }

    public List<AdminNightProgramVote.PreferredDay> normalizePreferredDays(
            List<AdminNightProgramVote.PreferredDay> values) {
        if (values == null || values.isEmpty()) {
            throw InvalidRequestException.invalidInput("희망 요일을 하나 이상 골라주세요.");
        }

        LinkedHashSet<AdminNightProgramVote.PreferredDay> normalized = new LinkedHashSet<>();
        for (AdminNightProgramVote.PreferredDay value : values) {
            if (value == null) {
                continue;
            }
            normalized.add(value);
            if (normalized.size() > 3) {
                throw InvalidRequestException.invalidInput("희망 요일은 금·토·일 안에서 골라주세요.");
            }
        }
        if (normalized.isEmpty()) {
            throw InvalidRequestException.invalidInput("희망 요일을 골라주세요.");
        }
        return List.copyOf(normalized);
    }

    public String normalizeEmail(String value, String fallbackEmail) {
        String email = StringUtils.hasText(value) ? value.trim() : fallbackEmail;
        if (!StringUtils.hasText(email) || !EMAIL_PATTERN.matcher(email).matches()) {
            throw InvalidRequestException.invalidInput("안내를 받을 이메일을 올바르게 적어주세요.");
        }
        if (email.length() > 120) {
            throw InvalidRequestException.invalidInput("이메일은 120자를 넘길 수 없습니다.");
        }
        return email;
    }

    public String normalizePhoneNumber(String value) {
        if (!StringUtils.hasText(value)) {
            throw InvalidRequestException.invalidInput("연락처를 적어주세요.");
        }

        String digits = value.replaceAll("\\D", "");
        if (!PHONE_DIGITS_PATTERN.matcher(digits).matches()) {
            throw InvalidRequestException.invalidInput("연락처는 010-1234-5678처럼 숫자 10~11자리로 적어주세요.");
        }
        return formatPhoneNumber(digits);
    }

    private String formatPhoneNumber(String digits) {
        if (digits.startsWith("02")) {
            if (digits.length() == 9) {
                return digits.substring(0, 2)
                        + "-"
                        + digits.substring(2, 5)
                        + "-"
                        + digits.substring(5);
            }
            return digits.substring(0, 2)
                    + "-"
                    + digits.substring(2, 6)
                    + "-"
                    + digits.substring(6);
        }

        if (digits.length() == 10) {
            return digits.substring(0, 3)
                    + "-"
                    + digits.substring(3, 6)
                    + "-"
                    + digits.substring(6);
        }
        return digits.substring(0, 3) + "-" + digits.substring(3, 7) + "-" + digits.substring(7);
    }

    public List<String> normalizeRequiredList(
            List<String> values, int maxSize, String emptyMessage) {
        if (values == null || values.isEmpty()) {
            throw InvalidRequestException.invalidInput(emptyMessage);
        }

        LinkedHashSet<String> normalized = new LinkedHashSet<>();
        for (String value : values) {
            if (!StringUtils.hasText(value)) {
                continue;
            }
            String item = value.trim();
            if (item.length() > 80) {
                throw InvalidRequestException.invalidInput("선택 항목은 80자를 넘길 수 없습니다.");
            }
            normalized.add(item);
            if (normalized.size() > maxSize) {
                throw InvalidRequestException.invalidInput("선택 항목이 너무 많습니다.");
            }
        }
        if (normalized.isEmpty()) {
            throw InvalidRequestException.invalidInput(emptyMessage);
        }
        return List.copyOf(normalized);
    }

    public String normalizeText(String value, String message) {
        if (!StringUtils.hasText(value)) {
            throw InvalidRequestException.invalidInput(message);
        }
        String normalized = value.trim();
        if (!REQUESTER_NAME_PATTERN.matcher(normalized).matches()) {
            throw InvalidRequestException.invalidInput("본명은 한글/영문 기준 2~40자로 적어주세요.");
        }
        return normalized;
    }

    public String normalizeOptionalText(String value, int maxLength) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        String normalized = value.trim();
        if (normalized.length() > maxLength) {
            throw InvalidRequestException.invalidInput("메시지가 너무 깁니다.");
        }
        return normalized;
    }
}
