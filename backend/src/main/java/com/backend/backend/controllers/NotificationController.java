package com.backend.backend.controllers;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import java.util.List;
import com.backend.backend.models.Notification;
import com.backend.backend.services.NotificationService;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {
    private final NotificationService service;
    public NotificationController(NotificationService service) { this.service = service; }

    @GetMapping
    public ResponseEntity<List<Notification>> getUserNotifications(@RequestParam String userId) {
        return ResponseEntity.ok(service.getForUser(userId));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<Notification> markRead(@PathVariable String id) {
        return ResponseEntity.ok(service.markRead(id));
    }

    @PostMapping("/test")
    public ResponseEntity<Notification> createTest(@RequestBody Notification n) {
        return ResponseEntity.ok(service.create(n));
    }
}
