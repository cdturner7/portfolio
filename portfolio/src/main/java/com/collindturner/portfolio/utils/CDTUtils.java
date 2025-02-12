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
import java.util.Collection;
import java.util.Map;
import java.util.stream.Collectors;

import org.apache.commons.lang3.StringUtils;

public class CDTUtils {

    // capitalize all words in a string
    public static String capitalizeAllWords(String input) {
        return Arrays.stream(input.split("\\s+"))
        .map(StringUtils::capitalize)
        .collect(Collectors.joining(" "));
    }

    // checks whether an object exists and has a value
    @SuppressWarnings("unchecked")
    public static boolean hasValue(Object obj) {
        if (obj == null) {
            return false;
        } else if (obj instanceof String) {
            return !"".equals(obj.toString().trim());
        } else if (obj instanceof Object[]) {
            return ((Object[]) obj).length > 0;
        } else if (obj instanceof Collection) {
            return ((Collection<Object>) obj).size() > 0;
        } else if (obj instanceof Map) {
            return ((Map<Object, Object>) obj).size() > 0;
        } else {
            return true;
        }
    }
}
