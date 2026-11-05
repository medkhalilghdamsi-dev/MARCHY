package com.sip.xsupply.file;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import static java.lang.System.currentTimeMillis;
import static java.nio.file.StandardCopyOption.REPLACE_EXISTING;

@Service
public class FileStorageService {

    @Value("${application.file.uploads.photos-output-path}")
    private String fileUploadPath;
    private static final Logger LOGGER = LoggerFactory.getLogger(FileStorageService.class);


    public String saveFile(String folderName, String entityPath, MultipartFile file) throws IOException {
        if (file == null) {
            return null;
        }

        String fileExtension = getFileExtension(file.getOriginalFilename());
        String fileName = currentTimeMillis() + "-" + UUID.randomUUID() + "." + fileExtension;
        Path imagePath = Paths.get(fileUploadPath).resolve(folderName).resolve(fileName).normalize();

        if (!Files.exists(imagePath.getParent())) {
            Files.createDirectories(imagePath.getParent());
        }

        Files.deleteIfExists(imagePath);
        Files.copy(file.getInputStream(), imagePath, REPLACE_EXISTING);

        return setFileUrl(fileName, entityPath);
    }

    private String setFileUrl(String fileName, String entityPath) {
        return ServletUriComponentsBuilder.fromCurrentContextPath()
                .path(entityPath + fileName)
                .toUriString();
    }

    private String getFileExtension(String fileName) {
        if (fileName == null || fileName.isEmpty()) {
            return "";
        }
        int lastDotIndex = fileName.lastIndexOf(".");
        if (lastDotIndex == -1) {
            return "";
        }
        return fileName.substring(lastDotIndex + 1).toLowerCase();
    }

    public String extractFileNameFromUrl(String fileUrl) {
        return (fileUrl != null && fileUrl.contains("/")) ?
                fileUrl.substring(fileUrl.lastIndexOf("/") + 1) : null;
    }
    public void deleteFile(String folder, String fileName) {
        if (fileName == null || fileName.isEmpty()) return;
        Path imagePath = Paths.get(fileUploadPath).resolve(folder).resolve(fileName).normalize();
        try {
            if (Files.exists(imagePath)) {
                Files.delete(imagePath);
                LOGGER.info("File deleted: {}", imagePath);
            }
        } catch (IOException e) {
            LOGGER.error("Error deleting file: {}", imagePath, e);
        }
    }
}
