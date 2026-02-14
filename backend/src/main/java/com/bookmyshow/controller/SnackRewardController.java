package com.bookmyshow.controller;

import com.bookmyshow.entity.SnackReward;
import com.bookmyshow.service.SnackRewardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rewards")
@CrossOrigin(origins = "http://localhost:3000")
public class SnackRewardController {
    @Autowired
    private SnackRewardService snackRewardService;

    @GetMapping("/{userId}")
    public ResponseEntity<List<SnackReward>> getActiveRewards(@PathVariable String userId) {
        List<SnackReward> rewards = snackRewardService.getActiveRewards(userId);
        return ResponseEntity.ok(rewards);
    }
}
