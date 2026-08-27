/*
 *******************************************************************************
 * Project: Portfolio Website
 *
 * Author: Collin Turner
 * =============================================================================
 * (c) Copyright 2025 CollinDTurner All rights reserved.
 *******************************************************************************
*/
package com.collindturner.portfolio.model;

import java.util.ArrayList;
import java.util.List;

/**
 * A single node in the fake "Project" tree that the IDE-styled site renders in
 * its left tool window. A node is either a {@link Type#FOLDER} (a grouping with
 * children) or a {@link Type#FILE} (an openable page backed by a Thymeleaf
 * fragment).
 */
public class ProjectNode {

    public enum Type { FOLDER, FILE }

    private final String name;
    private final Type type;
    private final String path;        // stable id used by the client, null for folders
    private final String iconType;    // css icon hint: folder, md, json, html, txt, java
    private final String language;    // status-bar language label, null for folders
    private final String fragment;    // "template :: fragment" resolved by ContentController, null for folders
    private boolean collapsedByDefault;
    private final List<ProjectNode> children = new ArrayList<>();

    private ProjectNode(String name, Type type, String path, String iconType, String language, String fragment) {
        this.name = name;
        this.type = type;
        this.path = path;
        this.iconType = iconType;
        this.language = language;
        this.fragment = fragment;
    }

    public static ProjectNode folder(String name) {
        return new ProjectNode(name, Type.FOLDER, null, "folder", null, null);
    }

    public static ProjectNode file(String name, String path, String iconType, String language, String fragment) {
        return new ProjectNode(name, Type.FILE, path, iconType, language, fragment);
    }

    public ProjectNode add(ProjectNode child) {
        this.children.add(child);
        return this;
    }

    public ProjectNode collapsed() {
        this.collapsedByDefault = true;
        return this;
    }

    public String getName() {
        return name;
    }

    public Type getType() {
        return type;
    }

    public String getPath() {
        return path;
    }

    public String getIconType() {
        return iconType;
    }

    public String getLanguage() {
        return language;
    }

    public String getFragment() {
        return fragment;
    }

    public boolean isCollapsedByDefault() {
        return collapsedByDefault;
    }

    public List<ProjectNode> getChildren() {
        return children;
    }
}
