/*
 *******************************************************************************
 * Project: Portfolio Website
 *
 * Author: Collin Turner
 * =============================================================================
 * (c) Copyright 2025 CollinDTurner All rights reserved.
 *******************************************************************************
*/
package com.collindturner.portfolio.model;

import java.util.LinkedHashMap;
import java.util.Map;

public class WebStyles {

    private Map<String, String> colors = new LinkedHashMap<>();

    private Map<String, String> fonts = new LinkedHashMap<>();

    private Map<String, String> other = new LinkedHashMap<>();

    public Map<String, String> getColors() {
        return colors;
    }

    public void setColors(Map<String, String> colors) {
        this.colors = colors;
    }

    public Map<String, String> getFonts() {
        return fonts;
    }

    public void setFonts(Map<String, String> fonts) {
        this.fonts = fonts;
    }

    public Map<String, String> getOther() {
        return other;
    }

    public void setOther(Map<String, String> other) {
        this.other = other;
    }
    
}
