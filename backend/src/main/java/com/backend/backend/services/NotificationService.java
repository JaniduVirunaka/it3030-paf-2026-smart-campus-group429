package com.backend.backend.services;

import org.springframework.stereotype.Service;
import com.backend.backend.repositories.NotificationRepository;
import com.backend.backend.models.Notification;
import java.util.List;

@Service
public class NotificationService {
    private final NotificationRepository repo;

    public NotificationService(NotificationRepository repo) { this.repo = repo; }

    public List<Notification> getForUser(String userId) {
        return repo.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public Notification markRead(String id) {
        Notification n = repo.findById(id).orElseThrow();
        n.setRead(true);
        return repo.save(n);
    }

    public Notification create(Notification n) {
        return repo.save(n);
    }
}
