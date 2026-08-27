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

import com.collindturner.portfolio.config.ProjectStructure;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;

@Controller
@RequestMapping({"", "/"})
public class IndexController extends BaseController {

    private final ProjectStructure projectStructure;

    public IndexController(ProjectStructure projectStructure) {
        this.projectStructure = projectStructure;
    }

    @GetMapping
    public String displayHomepage(Model model) {
        // the IDE shell renders the project tree server-side; tabs/content load on the client
        model.addAttribute("root", projectStructure.getRoot());
        return "ide";
    }

}
