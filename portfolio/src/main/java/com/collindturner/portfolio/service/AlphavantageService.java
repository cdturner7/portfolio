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

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import com.collindturner.portfolio.model.Result;
import com.collindturner.portfolio.model.Stock;

@Service
public class AlphavantageService extends BaseService {

    @Value("${alphavantage.api.key}")
    private String apiKey;

    public final static String FUNCTION_OVERVIEW             = "OVERVIEW";
	public final static String FUNCTION_TIME_SERIES_DAILY    = "TIME_SERIES_DAILY";
	public final static String FUNCTION_TIME_SERIES_INTRADAY = "TIME_SERIES_INTRADAY";

    private final RestClient alphaRestClient;

    public AlphavantageService() {
        alphaRestClient = RestClient.builder()
            .baseUrl("https://www.alphavantage.co/query")
            .build();
    }

    public Result<Stock> getStock(String ticker) {
        return getStock(ticker, FUNCTION_OVERVIEW);
    }

    public Result<Stock> getStock(String ticker, String function) {
        Result<Stock> result = new Result<>();
        try {
            Stock stock = alphaRestClient.get()
                .uri("?function=" + function + "&symbol=" + ticker + "&apikey=" + apiKey)
                .retrieve()
                .body(Stock.class);
            result.setData(stock);
        } catch (Exception e) {
            getLogger().error(e.getLocalizedMessage());
        }
        return result;
    }
}
