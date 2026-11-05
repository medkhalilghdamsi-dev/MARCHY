package com.sip.xsupply.UserModule.user.dto;


import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class ChangePasswordRequest {

    public String currentPassword;
    public String newPassword;
    public String confirmationPassword;

}
