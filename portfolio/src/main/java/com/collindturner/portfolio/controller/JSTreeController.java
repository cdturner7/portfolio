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
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.collindturner.portfolio.model.JSTree;
import com.collindturner.portfolio.service.JSTreeService;
import com.collindturner.portfolio.utils.SectionUtils.Section;

import org.springframework.stereotype.Controller;

@Controller
@RequestMapping("/jstreedata")
public class JSTreeController {
    
    @GetMapping("/{sectionID}")
    @ResponseBody
    public JSTree getData(@PathVariable String sectionID) {
        // convert section id to section enum map
        Section section = Section.getSectionFromID(sectionID);
        // get the js tree service based on the section
        JSTreeService jsTreeService = JSTreeService.getService(section);
        // if we dont have a service to build a tree with, return
        if (jsTreeService == null) {
            // return an empty jstree
            return new JSTree();
        }
        // call the jsTreeService to get the tree data
        jsTreeService.buildJSTree();
        // return the tree 
        return jsTreeService.getJsTree();
    }

}