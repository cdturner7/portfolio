/*
 *******************************************************************************
 * Project: Portfolio Website
 *
 * Author: Collin Turner
 * =============================================================================
 * (c) Copyright 2025 CollinDTurner All rights reserved.
 *******************************************************************************
*/
package com.collindturner.portfolio.config;

import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

/**
 * Exposes the request's own scheme + host as {@code ${baseUrl}} to every view,
 * so canonical / Open Graph URLs are correct whether the app is hit on
 * localhost, the Cloud Run URL, or a custom domain.
 */
@ControllerAdvice
public class SeoAdvice {

    @ModelAttribute("baseUrl")
    public String baseUrl() {
        String url = ServletUriComponentsBuilder.fromCurrentContextPath().build().toUriString();
        return url.endsWith("/") ? url.substring(0, url.length() - 1) : url;
    }
}
