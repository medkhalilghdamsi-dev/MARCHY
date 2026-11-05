package com.sip.xsupply.UserModule.user.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class UserFilter {
    private String roleName;
    private Boolean enabled;
    private String searchTerm;
}
