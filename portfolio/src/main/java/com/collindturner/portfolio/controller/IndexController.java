/*
 *******************************************************************************
 * Project: Portfolio Website
 *
 * Author: Collin Turner
 * =============================================================================
 * (c) Copyright 2024 CollinDTurner All rights reserved.
 *******************************************************************************
*/
package com.collindturner.portfolio.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import org.springframework.stereotype.Controller;

@Controller
@RequestMapping({"", "/"})
public class IndexController {

    @GetMapping
    public String displayHomepage() {
        return "index";
    }

}
