/*
 *******************************************************************************
 * Project: Portfolio Website
 *
 * Author: Collin Turner
 * =============================================================================
 * (c) Copyright 2025 CollinDTurner All rights reserved.
 *******************************************************************************
*/
package com.collindturner.portfolio.config;

import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.stereotype.Component;

import com.collindturner.portfolio.model.ProjectNode;

/**
 * Defines the contents of the fake "Project" tree shown in the IDE-styled site
 * and provides a flat path -> node lookup used when a file is opened.
 */
@Component
public class ProjectStructure {

    private final ProjectNode root;
    private final Map<String, ProjectNode> byPath = new LinkedHashMap<>();

    public ProjectStructure() {
        root = ProjectNode.folder("portfolio");

        root.add(ProjectNode.file("About.md", "About.md", "md", "Markdown", "pages/about :: content"));
        root.add(ProjectNode.file("Experience.md", "Experience.md", "md", "Markdown", "pages/experience :: content"));
        root.add(ProjectNode.file("Education.md", "Education.md", "md", "Markdown", "pages/education :: content"));
        root.add(ProjectNode.file("Resume.pdf", "Resume.pdf", "pdf", "PDF", "pages/resume :: content"));
        root.add(ProjectNode.file("Skills.json", "Skills.json", "json", "JSON", "pages/skills :: content"));
        root.add(ProjectNode.file("Contact.md", "Contact.md", "md", "Markdown", "pages/contact :: content"));
        root.add(ProjectNode.file("README.md", "README.md", "md", "Markdown", "pages/readme :: content"));
        root.add(ProjectNode.file("TODO.md", "TODO.md", "md", "Markdown", "pages/todo :: content"));

        ProjectNode projects = ProjectNode.folder("Projects");
        projects.add(ProjectNode.file("portfolio-site.md", "Projects/portfolio-site.md", "md", "Markdown",
                "pages/projects/portfolio-site :: content"));
        root.add(projects);

        ProjectNode notes = ProjectNode.folder("notes");
        notes.add(ProjectNode.file("ide-shell.md", "notes/ide-shell.md", "md", "Markdown",
                "pages/notes/ide-shell :: content"));
        notes.add(ProjectNode.file("json-tree.md", "notes/json-tree.md", "md", "Markdown",
                "pages/notes/json-tree :: content"));
        notes.add(ProjectNode.file("hash-routing.md", "notes/hash-routing.md", "md", "Markdown",
                "pages/notes/hash-routing :: content"));
        root.add(notes);

        ProjectNode config = ProjectNode.folder(".config").collapsed();
        config.add(ProjectNode.file("style-guide.html", ".config/style-guide.html", "html", "HTML",
                "pages/config/style-guide :: content"));
        config.add(ProjectNode.file("test.html", ".config/test.html", "txt", "Plain text",
                "pages/config/test :: content"));
        root.add(config);

        index(root);
    }

    private void index(ProjectNode node) {
        if (node.getPath() != null) {
            byPath.put(node.getPath(), node);
        }
        node.getChildren().forEach(this::index);
    }

    public ProjectNode getRoot() {
        return root;
    }

    public ProjectNode findByPath(String path) {
        return path == null ? null : byPath.get(path);
    }
}
