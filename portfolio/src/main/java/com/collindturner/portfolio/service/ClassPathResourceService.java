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

import java.nio.file.Files;

import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import com.collindturner.portfolio.model.Result;

@Service
public class ClassPathResourceService {

    public Result<String> getFileContents(String filePath) {
        Result<String> result = new Result<>();

        try {
             // Load the resource from the resources/static folder
            ClassPathResource resource = new ClassPathResource(filePath);
            String fileContent = Files.readString(resource.getFile().toPath());
            // set the file content in the result data
            result.setData(fileContent);
        } catch (Exception e) {
            e.printStackTrace();
        }
        return result;
    }

}
