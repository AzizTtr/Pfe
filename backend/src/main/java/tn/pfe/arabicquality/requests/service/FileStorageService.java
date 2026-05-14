package tn.pfe.arabicquality.requests.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import tn.pfe.arabicquality.config.AppProperties;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.DigestInputStream;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FileStorageService {

    private final AppProperties appProperties;

    public StoredFile store(MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }
        long maxBytes = appProperties.getStorage().getMaxFileSizeMb() * 1024L * 1024L;
        if (file.getSize() > maxBytes) {
            throw new IllegalArgumentException("File exceeds max size");
        }
        Set<String> allowed = Set.copyOf(appProperties.getStorage().getAllowedMimeTypes());
        String mimeType = file.getContentType() == null ? "application/octet-stream" : file.getContentType();
        if (!allowed.contains(mimeType)) {
            throw new IllegalArgumentException("Unsupported file type: " + mimeType);
        }

        String uuid = UUID.randomUUID().toString();
        String extension = extensionOf(file.getOriginalFilename());
        Path base = Path.of(appProperties.getStorage().getLocal().getBasePath()).toAbsolutePath().normalize();
        Files.createDirectories(base);
        Path target = base.resolve(uuid + extension).normalize();
        String sha256 = copyWithSha256(file, target);
        return new StoredFile(uuid, target.toString(), sha256, mimeType);
    }

    private String copyWithSha256(MultipartFile file, Path target) throws IOException {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            try (InputStream input = new DigestInputStream(file.getInputStream(), digest)) {
                Files.copy(input, target);
            }
            return HexFormat.of().formatHex(digest.digest());
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 is not available", e);
        }
    }

    private String extensionOf(String filename) {
        if (filename == null || !filename.contains(".")) return "";
        String ext = filename.substring(filename.lastIndexOf('.'));
        return ext.length() > 12 ? "" : ext;
    }

    public record StoredFile(String uuid, String storagePath, String sha256, String mimeType) {}
}
