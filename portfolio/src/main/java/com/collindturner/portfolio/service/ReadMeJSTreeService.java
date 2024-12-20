/*
 *******************************************************************************
 * Project: Portfolio Website
 *
 * Author: Collin Turner
 * =============================================================================
 * (c) Copyright 2024 CollinDTurner All rights reserved.
 *******************************************************************************
*/
package com.collindturner.portfolio.service;

import java.util.Arrays;

import org.springframework.stereotype.Service;

import com.collindturner.portfolio.model.JSTree;

@Service
public class ReadMeJSTreeService extends JSTreeService {

    @Override
    public void setParentNodeText() {
        parentNodeText = "README";
    }

    @Override
    public void buildJSTree() {
        super.buildJSTree();
        // children
        JSTree child1 = new JSTree("Testing Child Node 1");
        // set the children list in the js tree
        jsTree.setChildren(Arrays.asList(child1));
    }

}
