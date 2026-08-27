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

public class Result<T extends Object> {

    public enum Status {
        Successful,
        Error
    }

    private Status status;

    private T data;

    public Result() {
        this.status = Status.Successful;
    }

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }

    public boolean isSuccessful() {
        return status == Status.Successful;
    }

    public T getData() {
        return data;
    }

    public void setData(T data) {
        this.data = data;
    }

    @Override
    public String toString() {
        StringBuilder stringBuilder = new StringBuilder();
        stringBuilder.append(this.status);
        if (data != null) {
            stringBuilder.append("\n");
            stringBuilder.append(data.toString());
        }
        return stringBuilder.toString();
    }

}
