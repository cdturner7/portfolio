/*
 *******************************************************************************
 * Project: Portfolio Website
 *
 * Author: Collin Turner
 * =============================================================================
 * (c) Copyright 2025 CollinDTurner All rights reserved.
 *******************************************************************************
*/
package com.collindturner.portfolio.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * Serves the resume as a standalone, print-friendly HTML document. The IDE
 * shell's "Resume.pdf" tab embeds this page in an iframe; it is also directly
 * openable and prints cleanly to PDF via the browser.
 */
@Controller
public class ResumeController extends BaseController {

    @GetMapping("/resume")
    public String resume() {
        return "resume-doc";
    }
}
