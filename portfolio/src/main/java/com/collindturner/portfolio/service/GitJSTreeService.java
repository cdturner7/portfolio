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
public class GitJSTreeService extends JSTreeService {

    @Override
    public void setParentNodeText() {
        parentNodeText = GIT_PARENT;
    }

    @Override
    public void buildJSTree() {
        super.buildJSTree();
        // create all child and grandchild nodes
        JSTree child1 = new JSTree("Git Node 1");
        JSTree child2 = new JSTree("Git Node 2", FOLDER, true);
        JSTree child3 = new JSTree("Git Node 3");
        // set grandchildren
        child2.setChildren(Arrays.asList(child3));
        // set children
        jsTree.setChildren(Arrays.asList(child1, child2));
    }

}
