package com.carbacount.common.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class FileStorageService {

    @Value("${supabase.url:}")
    private String supabaseUrl;

    @Value("${supabase.service-key:}")
    private String supabaseServiceKey;

    @Value("${supabase.bucket-name:supporting-documents}")
    private String bucketName;

    @Autowired
    private RestTemplate restTemplate;

    public String storeFile(MultipartFile file) throws IOException {
        if (supabaseUrl == null || supabaseUrl.isBlank()) {
            // Local fallback or throw
            throw new RuntimeException("Supabase URL is not configured");
        }

        String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
        String uploadUrl = formatUrl(supabaseUrl) + "/storage/v1/object/" + bucketName + "/" + fileName;

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(supabaseServiceKey);
        headers.set("apiKey", supabaseServiceKey);
        headers.setContentType(MediaType.parseMediaType(file.getContentType()));

        HttpEntity<byte[]> entity = new HttpEntity<>(file.getBytes(), headers);

        // Supabase upload is POST /storage/v1/object/bucket/path
        ResponseEntity<String> response = restTemplate.exchange(
                uploadUrl,
                HttpMethod.POST, entity, String.class);

        if (response.getStatusCode().is2xxSuccessful()) {
            return fileName;
        } else {
            throw new RuntimeException("Failed to upload file to Supabase: " + response.getBody());
        }
    }

    public String getSignedUrl(String fileName) {
        String signUrl = formatUrl(supabaseUrl) + "/storage/v1/object/sign/" + bucketName + "/" + fileName;

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(supabaseServiceKey);
        headers.set("apiKey", supabaseServiceKey);
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> body = new HashMap<>();
        body.put("expiresIn", 3600); // 1 hour

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        ParameterizedTypeReference<Map<String, Object>> typeRef = new ParameterizedTypeReference<Map<String, Object>>() {
        };

        ResponseEntity<Map<String, Object>> response = restTemplate.exchange(signUrl, HttpMethod.POST, entity, typeRef);

        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
            String signedPath = (String) response.getBody().get("signedURL");
            // signedURL returned is often like
            // /storage/v1/object/sign/bucket/path?token=...
            return formatUrl(supabaseUrl) + signedPath;
        } else {
            throw new RuntimeException("Failed to get signed URL from Supabase");
        }
    }

    public byte[] downloadFile(String fileName) {
        String downloadUrl = formatUrl(supabaseUrl) + "/storage/v1/object/" + bucketName + "/" + fileName;

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(supabaseServiceKey);
        headers.set("apiKey", supabaseServiceKey);

        HttpEntity<Void> entity = new HttpEntity<>(headers);

        ResponseEntity<byte[]> response = restTemplate.exchange(downloadUrl, HttpMethod.GET, entity, byte[].class);

        if (response.getStatusCode().is2xxSuccessful()) {
            return response.getBody();
        } else {
            throw new RuntimeException("Failed to download file from Supabase");
        }
    }

    public void deleteFile(String fileName) {
        String deleteUrl = formatUrl(supabaseUrl) + "/storage/v1/object/" + bucketName + "/" + fileName;

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(supabaseServiceKey);
        headers.set("apiKey", supabaseServiceKey);

        HttpEntity<Void> entity = new HttpEntity<>(headers);

        try {
            restTemplate.exchange(deleteUrl, HttpMethod.DELETE, entity, Void.class);
        } catch (Exception e) {
            // Log warning
        }
    }

    private String formatUrl(String url) {
        if (url == null)
            return "";
        if (url.endsWith("/")) {
            return url.substring(0, url.length() - 1);
        }
        return url;
    }
}
