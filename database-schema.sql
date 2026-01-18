-- BookMyShow Database Schema
-- This file shows the database structure
-- Tables are auto-created by Spring Boot JPA, but this is for reference

CREATE DATABASE IF NOT EXISTS bookmyshow;
USE bookmyshow;

-- Movies Table
CREATE TABLE IF NOT EXISTS movies (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    language ENUM('TELUGU', 'HINDI') NOT NULL,
    genre VARCHAR(255) NOT NULL,
    duration INT NOT NULL
);

-- Theatres Table
CREATE TABLE IF NOT EXISTS theatres (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    city VARCHAR(255) NOT NULL
);

-- Shows Table
CREATE TABLE IF NOT EXISTS shows (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    movie_id BIGINT NOT NULL,
    theatre_id BIGINT NOT NULL,
    show_time DATETIME NOT NULL,
    available_seats INT NOT NULL,
    FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
    FOREIGN KEY (theatre_id) REFERENCES theatres(id) ON DELETE CASCADE
);

-- Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    show_id BIGINT NOT NULL,
    seats_booked INT NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    booking_time DATETIME NOT NULL,
    FOREIGN KEY (show_id) REFERENCES shows(id) ON DELETE CASCADE
);

-- Indexes for better performance
CREATE INDEX idx_movies_language ON movies(language);
CREATE INDEX idx_theatres_city ON theatres(city);
CREATE INDEX idx_shows_movie_city ON shows(movie_id, theatre_id);
CREATE INDEX idx_shows_time ON shows(show_time);

