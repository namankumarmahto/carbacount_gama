package com.carbacount.auth.controller;

import com.carbacount.auth.dto.*;
import com.carbacount.auth.service.AuthService;
import com.carbacount.common.response.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class InvitationController {

    @Autowired
    private AuthService authService;

    @PostMapping("/set-password")
    public ResponseEntity<ApiResponse<String>> setPassword(@Valid @RequestBody SetPasswordRequest request) {
        try {
            authService.setPassword(request);
            return ResponseEntity.ok(new ApiResponse<>(true, "Password set successfully", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<String>> forgotPassword(@RequestParam String email) {
        try {
            // Implementation for forgot password
            return ResponseEntity.ok(new ApiResponse<>(true, "Instruction sent to email", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }
}
