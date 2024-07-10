/*
 *******************************************************************************
 * Project: Portfolio Website
 *
 * Author: Collin Turner
 * =============================================================================
 * (c) Copyright 2024 CollinDTurner All rights reserved.
 *******************************************************************************
*/
package com.collindturner.portfolio.model;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.collindturner.portfolio.service.JSTreeService;

public class JSTree {

    // attributes for li and a tags auto generated
    public static final String CLASS = "class";

    private String id;
    
    private String text;

    private String icon;

    private State state;

    private List<JSTree> children;

    private Map<String, String> li_attr = new HashMap<>();  // attributes for the generated list items (nodes)

    private Map<String, String> a_attr = new HashMap<>();   // attributes for the generated anchor tags for node

    public JSTree() {
    }

    public JSTree(String text) {
        this(text, JSTreeService.FILE, false);
    }

    public JSTree(String text, String icon) {
        this(text, icon, (icon.equals(JSTreeService.FOLDER) ? true : false));
    }

    public JSTree(String text, String icon, boolean isFolder) {
        this.text = text;
        this.icon = icon;
        if (isFolder) {
            setFolderAttributes();
        }
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public String getIcon() {
        return icon;
    }

    public void setIcon(String icon) {
        this.icon = icon;
    }

    public State getState() {
        return state;
    }

    public void setState(State state) {
        this.state = state;
    }

    public List<JSTree> getChildren() {
        return children;
    }

    public void setChildren(List<JSTree> children) {
        this.children = children;
    }

    public Map<String, String> getLi_attr() {
        return li_attr;
    }

    public void setLi_attr(Map<String, String> li_attr) {
        this.li_attr = li_attr;
    }

    public Map<String, String> getA_attr() {
        return a_attr;
    }

    public void setA_attr(Map<String, String> a_attr) {
        this.a_attr = a_attr;
    }

    public void setFolderAttributes() {
        a_attr.put(CLASS, "folder-node");
    }

}
