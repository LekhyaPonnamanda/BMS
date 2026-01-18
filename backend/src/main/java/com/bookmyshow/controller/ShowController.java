package com.bookmyshow.controller;

import com.bookmyshow.dto.*;
import com.bookmyshow.entity.Show;
import com.bookmyshow.service.SeatHoldService;
import com.bookmyshow.service.SeatMapService;
import com.bookmyshow.service.ShowService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/shows")
@CrossOrigin(origins = "http://localhost:3000")
public class ShowController {

    @Autowired
    private ShowService showService;

    @Autowired
    private SeatMapService seatMapService;

    @Autowired
    private SeatHoldService seatHoldService;

    // Get shows by movie ID and city
    @GetMapping
    public ResponseEntity<List<Show>> getShows(
            @RequestParam(required = false) Long movieId,
            @RequestParam(required = false) String city) {
        if (movieId != null && city != null) {
            return ResponseEntity.ok(showService.getShowsByMovieIdAndCity(movieId, city));
        } else if (city != null) {
            return ResponseEntity.ok(showService.getShowsByCity(city));
        } else {
            return ResponseEntity.ok(showService.getAllShows());
        }
    }

    // Get show by ID
    @GetMapping("/{id}")
    public ResponseEntity<Show> getShowById(@PathVariable Long id) {
        return showService.getShowById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Get seat map for a show (optional userId to highlight held seats)
    @GetMapping("/{id}/seats")
    public ResponseEntity<SeatMapResponse> getShowSeats(
            @PathVariable Long id,
            @RequestParam(required = false) String userId) {
        return seatMapService.getSeatMap(id, userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Hold seats for a show
    @PostMapping("/{id}/seats/hold")
    public ResponseEntity<HoldSeatsResponse> holdSeats(
            @PathVariable Long id,
            @RequestBody HoldSeatsRequest request) {
        return ResponseEntity.ok(seatHoldService.holdSeats(id, request));
    }

    // Release held seats for a show
    @PostMapping("/{id}/seats/release")
    public ResponseEntity<ReleaseSeatsResponse> releaseSeats(
            @PathVariable Long id,
            @RequestBody ReleaseSeatsRequest request) {
        return ResponseEntity.ok(seatHoldService.releaseSeats(id, request));
    }
}
