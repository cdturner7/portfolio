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

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import com.collindturner.portfolio.service.CSSService;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;

@Controller
@RequestMapping("/styleguide")
public class StyleGuideController extends BaseController {

    private CSSService cssService;

    public StyleGuideController(CSSService cssService) {
        this.cssService = cssService;
    }

    @GetMapping
    public String displayStyleGuide(Model model) {
        // save the root css variables to the model
        model.addAttribute("variables", cssService.getRootVariables().getData());
        return "style-guide";
    }

}