/*
 *******************************************************************************
 * Project: Portfolio Website
 *
 * Author: Collin Turner
 * =============================================================================
 * (c) Copyright 2025 CollinDTurner All rights reserved.
 *******************************************************************************
*/
package com.collindturner.portfolio.service;

import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.stereotype.Service;

import com.collindturner.portfolio.model.Result;
import com.collindturner.portfolio.model.WebStyles;
import com.collindturner.portfolio.utils.CDTUtils;

@Service
public class CSSService {

    public final String CSS_PATH = "static/css/style.css";

    private ClassPathResourceService classPathResourceService;

    public CSSService(ClassPathResourceService classPathResourceService) {
        this.classPathResourceService = classPathResourceService;
    }

    public Result<WebStyles> getRootVariables() {
        Result<WebStyles> result = new Result<>();
        WebStyles rootVariables = new WebStyles();
        try {
            // get the css file contents
            Result<String> cssContentResult = classPathResourceService.getFileContents(CSS_PATH);
            // Extract root variables using regex
            rootVariables = extractRootVariables(cssContentResult.getData());
            // add root variables to the result
            result.setData(rootVariables);
        } catch (Exception e) {
            e.printStackTrace();
        }
        return result;
    }

    private WebStyles extractRootVariables(String cssContent) {
        WebStyles webStyles = new WebStyles();
    
        // Regex to match the :root block
        String rootRegex = ":root\\s*\\{([^}]*)}";
        Pattern rootPattern = Pattern.compile(rootRegex, Pattern.DOTALL);
        Matcher rootMatcher = rootPattern.matcher(cssContent);
    
        if (rootMatcher.find()) {
            String rootContent = rootMatcher.group(1);
    
            // Extract and classify variables
            extractVariables(rootContent, "--color-([a-zA-Z0-9-]+)", webStyles.getColors());
            extractVariables(rootContent, "--font-([a-zA-Z0-9-]+)", webStyles.getFonts());
            extractOtherVariables(rootContent, "--([a-zA-Z0-9-]+)", webStyles);
        }
        return webStyles;
    }
    
    private void extractVariables(String content, String regex, Map<String, String> targetMap) {
        Pattern pattern = Pattern.compile(regex + "\\s*:\\s*([^;]+);");
        Matcher matcher = pattern.matcher(content);
    
        while (matcher.find()) {
            String variableName = CDTUtils.capitalizeAllWords(matcher.group(1).trim().replaceAll("-", " "));
            String variableValue = matcher.group(2).trim();
            targetMap.put(variableName, variableValue);
        }
    }
    
    private void extractOtherVariables(String content, String regex, WebStyles webStyles) {
        Pattern pattern = Pattern.compile(regex + "\\s*:\\s*([^;]+);");
        Matcher matcher = pattern.matcher(content);
    
        while (matcher.find()) {
            String variableName = CDTUtils.capitalizeAllWords(matcher.group(1).trim().replaceAll("-", " "));
            String variableValue = matcher.group(2).trim();
    
            // Skip if the variable already exists in colors or fonts
            if (!webStyles.getColors().containsKey(variableName.replace("Color ", "")) && 
                !webStyles.getFonts().containsKey(variableName.replace("Font ", ""))) {
                webStyles.getOther().put(variableName, variableValue);
            }
        }
    }

}
