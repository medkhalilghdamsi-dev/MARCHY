package com.sip.xsupply.UserModule.user;

import com.sip.xsupply.file.FileStorageService;
import com.sip.xsupply.UserModule.user.dto.ChangePasswordRequest;
import com.sip.xsupply.UserModule.user.dto.UserMapper;
import com.sip.xsupply.UserModule.user.dto.UserResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service
@RequiredArgsConstructor
public class UserService {
    @Value("${application.file.uploads.photos-output-path}")
    private String uploadsDirectory;

    private final FileStorageService fileStorageService;
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final TokenRepository tokenRepository;

    public String uploadProfilePicture(MultipartFile file, Authentication authentication) throws IOException {
        User user = (User) authentication.getPrincipal();
        if (user.getProfilePicture() != null && !user.getProfilePicture().isEmpty()) {
            String oldFileName = fileStorageService.extractFileNameFromUrl(user.getProfilePicture());
            fileStorageService.deleteFile("profilePictures", oldFileName);
        }
        String fileUrl = fileStorageService.saveFile("profilePictures", "/user/profilePicture/", file);
        user.setProfilePicture(fileUrl);
        userRepository.save(user);

        return fileUrl;
    }

    public User getUserById(int id) {
        return userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
    }

    public UserResponse getUserResponseById(int id) {
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        return userMapper.toUserResponse(user);
    }

    public void changePassword(ChangePasswordRequest changePasswordRequest, Authentication connectedUser) {
        User currentUser = (User) connectedUser.getPrincipal();
        if (!passwordEncoder.matches(changePasswordRequest.getCurrentPassword(), currentUser.getPassword())) {
            throw new IllegalStateException("Wrong password ");
        }
        if (!changePasswordRequest.getNewPassword().equals(changePasswordRequest.getConfirmationPassword())) {
            throw new IllegalStateException("Password are not the same");
        }
        currentUser.setPassword(passwordEncoder.encode(changePasswordRequest.getNewPassword()));
        userRepository.save(currentUser);
    }

    @Transactional
    public void deleteUser(int id){
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        tokenRepository.deleteAllByUser(user);
        userRepository.deleteById(id);
    }
}
