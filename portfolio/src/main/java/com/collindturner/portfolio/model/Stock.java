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

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public class Stock {

    @JsonProperty("Symbol")
    private String symbol;

    private String name;

    private String sector;

    private String industry;

    private String marketCapitalization;

    private int sharesShort;

    private int sharesShortPriorMonth;

    private float shortRatio;

    public String getSymbol() {
        return symbol;
    }

    public void setSymbol(String symbol) {
        this.symbol = symbol;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSector() {
        return sector;
    }

    public void setSector(String sector) {
        this.sector = sector;
    }

    public String getIndustry() {
        return industry;
    }

    public void setIndustry(String industry) {
        this.industry = industry;
    }

    public String getMarketCapitalization() {
        return marketCapitalization;
    }

    public void setMarketCapitalization(String marketCapitalization) {
        this.marketCapitalization = marketCapitalization;
    }

    public int getSharesShort() {
        return sharesShort;
    }

    public void setSharesShort(int sharesShort) {
        this.sharesShort = sharesShort;
    }

    public int getSharesShortPriorMonth() {
        return sharesShortPriorMonth;
    }

    public void setSharesShortPriorMonth(int sharesShortPriorMonth) {
        this.sharesShortPriorMonth = sharesShortPriorMonth;
    }

    public float getShortRatio() {
        return shortRatio;
    }

    public void setShortRatio(float shortRatio) {
        this.shortRatio = shortRatio;
    }

    public String toString() {
        return "Ticker: " + this.symbol;
    }

}