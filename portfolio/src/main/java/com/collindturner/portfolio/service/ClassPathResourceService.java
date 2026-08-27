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

import java.io.InputStream;
import java.nio.charset.StandardCharsets;

import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StreamUtils;

import com.collindturner.portfolio.model.Result;

@Service
public class ClassPathResourceService extends BaseService {

    public Result<String> getFileContents(String filePath) {
        Result<String> result = new Result<>();

        // Read the resource as a stream so it also works when the app is packaged as a jar.
        ClassPathResource resource = new ClassPathResource(filePath);
        try (InputStream inputStream = resource.getInputStream()) {
            String fileContent = StreamUtils.copyToString(inputStream, StandardCharsets.UTF_8);
            result.setData(fileContent);
        } catch (Exception e) {
            result.setStatus(Result.Status.Error);
            error("Failed to read classpath resource '" + filePath + "': " + e.getLocalizedMessage());
        }
        return result;
    }

}
