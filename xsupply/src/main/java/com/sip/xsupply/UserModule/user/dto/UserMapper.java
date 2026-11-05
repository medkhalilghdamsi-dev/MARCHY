package com.sip.xsupply.UserModule.user.dto;

import com.sip.xsupply.UserModule.user.User;
import org.springframework.stereotype.Service;

@Service
public class UserMapper {
    public UserResponse toUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .firstname(user.getFirstname())
                .lastname(user.getLastname())
                .email(user.getEmail())
                .profilePicture(user.getProfilePicture())
                .role(!user.getRoles().isEmpty() ? user.getRoles().get(0).getName() : null)
                .enabled(user.isEnabled())
                .accountLocked(user.isAccountLocked())
                .build();
    }
}
