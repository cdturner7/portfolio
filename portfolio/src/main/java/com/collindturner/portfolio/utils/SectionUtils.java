/*
 *******************************************************************************
 * Project: Portfolio Website
 *
 * Author: Collin Turner
 * =============================================================================
 * (c) Copyright 2024 CollinDTurner All rights reserved.
 *******************************************************************************
*/
package com.collindturner.portfolio.utils;

public class SectionUtils {

    public enum Section {
        GIT("git-section"),
        README("readme-section"),
        RESUME("resume-section"),
        PROFILE("profile-section"),
        SETTINGS("settings-section");

        private String id;

        Section(String id) {
            this.id = id;
        }

        public String getID() {
            return this.id;
        }

        public static Section getSectionFromID(String sectionID) {
            for (Section section : Section.values()) {
                if (section.id.equalsIgnoreCase(sectionID)) {
                    return section;
                }
            }
            return null;
        }
    }

}
