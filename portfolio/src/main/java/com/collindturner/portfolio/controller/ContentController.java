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
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.collindturner.portfolio.config.ProjectStructure;
import com.collindturner.portfolio.model.ProjectNode;
import com.collindturner.portfolio.model.WebStyles;
import com.collindturner.portfolio.service.CSSService;

/**
 * Serves the body of a single "file" as an HTML fragment. The IDE shell fetches
 * this when a tab is opened and injects the response into the editor pane.
 */
@Controller
public class ContentController extends BaseController {

    private static final String STYLE_GUIDE_PATH = ".config/style-guide.html";

    private final ProjectStructure projectStructure;
    private final CSSService cssService;

    public ContentController(ProjectStructure projectStructure, CSSService cssService) {
        this.projectStructure = projectStructure;
        this.cssService = cssService;
    }

    @GetMapping("/content")
    public String content(@RequestParam("path") String path, Model model) {
        ProjectNode node = projectStructure.findByPath(path);
        if (node == null || node.getFragment() == null) {
            model.addAttribute("missingPath", path);
            return "pages/not-found :: content";
        }

        if (STYLE_GUIDE_PATH.equals(path)) {
            WebStyles variables = cssService.getRootVariables().getData();
            model.addAttribute("variables", variables != null ? variables : new WebStyles());
        }

        return node.getFragment();
    }
}
