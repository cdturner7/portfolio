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

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class BaseProcessor {

    private final Logger logger = LoggerFactory.getLogger(BaseProcessor.class);

    public Logger getLogger() {
        Logger classLogger = LoggerFactory.getLogger(getClass());
        if (classLogger == null) {
            classLogger = logger;
        }
        return classLogger;
    }

    // logs an info level message
    public void info(String message) {
        getLogger().info(message);
    }

    // logs a debug level message
    public void debug(String message) {
        getLogger().debug(message);
    }

    // logs an error message
    public void error(String error) {
        getLogger().error(error);
    }

}
