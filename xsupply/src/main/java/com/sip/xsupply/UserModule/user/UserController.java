package com.sip.xsupply.UserModule.user;

import com.sip.xsupply.UserModule.user.dto.ChangePasswordRequest;
import com.sip.xsupply.UserModule.user.dto.UserResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.HttpHeaders;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@RestController
@RequestMapping("user")
@RequiredArgsConstructor
@Tag(name = "User")
public class UserController {
    private final UserRepository userRepository;
    private final UserDetailsServiceImpl userDetailsService;
    private final UserService userService;

    @Value("${application.file.uploads.photos-output-path}")
    private String fileUploadPath;

    @GetMapping("/loadUserByUsername")
    public ResponseEntity<UserDetails> loadUserByUsername(@RequestParam("email") String email) {
        try {
            UserDetails userDetails = userDetailsService.loadUserByUsername(email);
            return ResponseEntity.ok(userDetails);
        } catch (UsernameNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }

    @GetMapping
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @GetMapping("/{email}")
    public User getUserByEmail(@PathVariable String email) {
        return userRepository.findByEmail(email).orElse(null);
    }

    @GetMapping("/loadById/{id}")
    public UserResponse getUserById(@PathVariable int id) {
        return userService.getUserResponseById(id);
    }

    @PostMapping("/upload-profile-picture")
    public ResponseEntity<String> uploadProfilePicture(
            @RequestParam("file") MultipartFile file,
            Authentication authentication
    ) throws IOException {
        String profilePictureUrl = userService.uploadProfilePicture(file, authentication);
        return ResponseEntity.ok("Profile picture uploaded successfully: " + profilePictureUrl);
    }

    @GetMapping(path = "/profilePicture/{fileName}")
    public ResponseEntity<byte[]> getProfilePicture(@PathVariable("fileName") String fileName) throws IOException {
        Path imagePath = Paths.get(fileUploadPath).resolve("profilePictures").resolve(fileName).normalize();

        if (!Files.exists(imagePath) || !Files.isReadable(imagePath)) {
            return ResponseEntity.notFound().build();
        }

        byte[] fileContent = Files.readAllBytes(imagePath);
        String mimeType = Files.probeContentType(imagePath);

        HttpHeaders headers = new HttpHeaders();
        headers.set(HttpHeaders.CONTENT_TYPE, mimeType);

        return new ResponseEntity<>(fileContent, headers, HttpStatus.OK);
    }

    @PatchMapping
    public ResponseEntity<?> changePassword(@RequestBody ChangePasswordRequest changePasswordRequest, Authentication authentication) {
        userService.changePassword(changePasswordRequest, authentication);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public void deleteUser(@PathVariable int id) {
        userService.deleteUser(id);
    }
}
