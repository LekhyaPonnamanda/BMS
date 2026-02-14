package com.bookmyshow.controller;

import com.bookmyshow.service.SnackRewardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/rewards/points")
@CrossOrigin(origins = "http://localhost:3000")
public class SnackRewardPointsController {
    @Autowired
    private SnackRewardService snackRewardService;

    @GetMapping("/{userId}")
    public ResponseEntity<Integer> getActivePoints(@PathVariable String userId) {
        int points = snackRewardService.getActivePoints(userId);
        return ResponseEntity.ok(points);
    }
}
