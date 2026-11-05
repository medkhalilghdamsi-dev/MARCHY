package com.sip.xsupply.auth;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@Builder
public class ActivationResponse {
    private String message;
    private boolean success;
    private String errorMessage;
    private String frontendLoginUrl;
}