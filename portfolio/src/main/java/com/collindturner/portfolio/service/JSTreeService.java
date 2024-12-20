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

import org.springframework.stereotype.Service;

import com.collindturner.portfolio.model.JSTree;
import com.collindturner.portfolio.model.State;
import com.collindturner.portfolio.utils.SectionUtils.Section;

@Service
public abstract class JSTreeService {

    // parent folder text
    public final static String GIT_PARENT      = "Git";
    public final static String RESUME_PARENT   = "Resume";
    public final static String README_PARENT   = "README";
    public final static String PROFILE_PARENT  = "Profile";
    public final static String SETTINGS_PARENT = "Git";

    // icon dir locations
    public final static String FILE        = "/images/icons/file-icon.svg";
    public final static String FOLDER      = "/images/icons/folder-icon.svg";
    public final static String FOLDER_OPEN = "/images/icons/folder-open-icon.svg";

    protected JSTree jsTree;

    protected String parentNodeText;
    
    public abstract void setParentNodeText();

    public void buildJSTree() {
        // set the paren node text
        setParentNodeText();
        // create the parent node for the selected section
        jsTree = new JSTree(parentNodeText, FOLDER);
        // create the state for the parent node
        State parentState = new State(true);
        // set the parent node state, with created state above
        jsTree.setState(parentState);
    }

    // gets the proper service based on the section selected
    public static JSTreeService getService(Section section) {
        switch (section) {
            case GIT:
                return new GitJSTreeService();
            //case PROFILE:
            //    return null;
            case README:
                return new ReadMeJSTreeService();
            //case RESUME:
            //    return null;
            //case SETTINGS:
            //    return null;
            //case THREEJS:
            //    return null;
            default:
                System.out.println("no js tree service for section: " + section.getID());
                return null;
        }
    }

    public JSTree getJsTree() {
        return this.jsTree;
    }

}
