package com.kscold.blog.stackshare.application.service;

import java.text.NumberFormat;
import java.util.Locale;

final class StackShareAmountFormatter {

    private StackShareAmountFormatter() {}

    static String formatWon(long amount) {
        return NumberFormat.getNumberInstance(Locale.KOREA).format(amount) + "원";
    }
}
