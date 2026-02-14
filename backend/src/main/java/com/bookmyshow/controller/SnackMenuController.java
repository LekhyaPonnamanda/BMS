package com.bookmyshow.controller;

import com.bookmyshow.entity.Snack;
import com.bookmyshow.repository.SnackRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/snacks/menu")
@CrossOrigin(origins = "http://localhost:3000")
public class SnackMenuController {
    @Autowired
    private SnackRepository snackRepository;

    // For demo: return all snacks for any theatre
    @GetMapping("/{theatreId}")
    public ResponseEntity<List<Snack>> getMenu(@PathVariable Long theatreId) {
        return ResponseEntity.ok(snackRepository.findAll());
    }
}
