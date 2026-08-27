/*
 *******************************************************************************
 * Project: Portfolio Website
 *
 * Author: Collin Turner
 * =============================================================================
 * (c) Copyright 2025 CollinDTurner All rights reserved.
 *******************************************************************************
*/
package com.collindturner.portfolio.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import com.collindturner.portfolio.service.AlphavantageService;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import com.collindturner.portfolio.model.Result;
import com.collindturner.portfolio.model.Stock;


@Controller
@RequestMapping("/alpha")
public class AlphaClientController extends BaseController {

    private final AlphavantageService alphavantageService;

    public AlphaClientController(AlphavantageService alphavantageService) {
        this.alphavantageService = alphavantageService;
    }

    @GetMapping("/{ticker}")
    public String displayView(@PathVariable(required = true) String ticker, Model model) {
        Result<Stock> stockResult = alphavantageService.getStock(ticker);
        String overview = stockResult.isSuccessful() && stockResult.getData() != null
            ? stockResult.getData().toString()
            : "No data available for ticker '" + ticker + "'.";
        model.addAttribute("stockOverview", overview);
        return "api-client";
    }

}
