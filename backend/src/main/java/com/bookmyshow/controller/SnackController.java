package com.bookmyshow.controller;

import com.bookmyshow.entity.Snack;
import com.bookmyshow.repository.SnackRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/snacks")
@CrossOrigin(origins = "http://localhost:3000")
public class SnackController {
    @Autowired
    private SnackRepository snackRepository;

    @GetMapping
    public ResponseEntity<List<Snack>> getAllSnacks() {
        return ResponseEntity.ok(snackRepository.findAll());
    }
}
