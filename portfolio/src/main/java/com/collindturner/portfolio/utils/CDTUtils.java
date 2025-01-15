/*
 *******************************************************************************
 * Project: Portfolio Website
 *
 * Author: Collin Turner
 * =============================================================================
 * (c) Copyright 2025 CollinDTurner All rights reserved.
 *******************************************************************************
*/
package com.collindturner.portfolio.utils;

import java.util.Arrays;
import java.util.stream.Collectors;

import org.apache.commons.lang3.StringUtils;

public class CDTUtils {

    // capitalize all words in a string
    public static String capitalizeAllWords(String input) {
        return Arrays.stream(input.split("\\s+"))
        .map(StringUtils::capitalize)
        .collect(Collectors.joining(" "));
    }
}
