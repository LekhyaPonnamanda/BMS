package com.bookmyshow.service;

import com.bookmyshow.entity.Show;
import com.bookmyshow.repository.ShowRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ShowService {
    @Autowired
    private ShowRepository showRepository;

    public List<Show> getAllShows() {
        return showRepository.findAll();
    }

    public List<Show> getShowsByMovieIdAndCity(Long movieId, String city) {
        return showRepository.findByMovieIdAndCity(movieId, city);
    }

    public List<Show> getShowsByCity(String city) {
        return showRepository.findByTheatreCity(city);
    }

    public Optional<Show> getShowById(Long id) {
        return showRepository.findById(id);
    }

    public Show saveShow(Show show) {
        return showRepository.save(show);
    }

    public Show updateShow(Show show) {
        return showRepository.save(show);
    }
}

