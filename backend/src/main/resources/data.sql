-- Insert Movies
INSERT INTO movies (name, language, genre, duration) VALUES
('Baahubali 2', 'TELUGU', 'Action', 167),
('RRR', 'TELUGU', 'Action', 182),
('Pushpa', 'TELUGU', 'Action', 179),
('Dangal', 'HINDI', 'Drama', 161),
('3 Idiots', 'HINDI', 'Comedy', 170),
('PK', 'HINDI', 'Comedy', 153),
('KGF Chapter 2', 'TELUGU', 'Action', 168),
('Jawan', 'HINDI', 'Action', 169);

-- Insert Theatres
INSERT INTO theatres (name, city) VALUES
('PVR Cinemas', 'Hyderabad'),
('INOX', 'Hyderabad'),
('Cinepolis', 'Hyderabad'),
('PVR Cinemas', 'Bangalore'),
('INOX', 'Bangalore'),
('Cinepolis', 'Bangalore'),
('PVR Cinemas', 'Chennai'),
('INOX', 'Chennai'),
('Cinepolis', 'Chennai');

-- Insert Shows (using movie and theatre IDs)
-- Note: These IDs will be auto-generated, so adjust based on actual IDs
-- For Hyderabad
INSERT INTO shows (movie_id, theatre_id, show_time, available_seats) VALUES
(1, 1, '2026-01-18 21:10:00', 50),
(1, 1, '2026-01-18 21:15:00', 50),
(1, 2, '2026-01-18 21:20:00', 50),
(2, 1, '2026-01-18 21:25:00', 50),
(2, 3, '2026-01-18 21:30:00', 50),
(3, 2, '2026-01-18 21:10:00', 50),
(4, 1, '2026-01-18 21:10:00', 50),
(4, 3, '2026-01-18 21:10:00', 50),
(5, 2, '2026-01-18 21:10:00', 50);



-- For Bangalore
INSERT INTO shows (movie_id, theatre_id, show_time, available_seats) VALUES
(1, 4, '2024-12-20 10:00:00', 50),
(1, 4, '2024-12-20 14:00:00', 50),
(2, 5, '2024-12-20 11:00:00', 50),
(2, 6, '2024-12-20 18:00:00', 50),
(3, 4, '2024-12-20 20:00:00', 50),
(4, 5, '2024-12-20 16:00:00', 50),
(5, 6, '2024-12-20 12:00:00', 50),
(6, 4, '2024-12-20 15:00:00', 50);

-- For Chennai
INSERT INTO shows (movie_id, theatre_id, show_time, available_seats) VALUES
(1, 7, '2024-12-20 10:00:00', 50),
(2, 8, '2024-12-20 14:00:00', 50),
(3, 9, '2024-12-20 11:00:00', 50),
(4, 7, '2024-12-20 18:00:00', 50),
(5, 8, '2024-12-20 20:00:00', 50),
(6, 9, '2024-12-20 16:00:00', 50);

-- Insert 50 seats per theatre: 5 rows (A-E) x 10 seats each
INSERT IGNORE INTO seats (theatre_id, row_label, seat_number, seat_type, is_active)
SELECT
    t.id AS theatre_id,
    r.row_label,
    n.seat_number,
    CASE
        WHEN r.row_label IN ('A', 'B') THEN 'VIP'
        WHEN r.row_label IN ('C', 'D') THEN 'PREMIUM'
        ELSE 'REGULAR'
    END AS seat_type,
    TRUE AS is_active
FROM theatres t
CROSS JOIN (
    SELECT 'A' AS row_label
    UNION ALL SELECT 'B'
    UNION ALL SELECT 'C'
    UNION ALL SELECT 'D'
    UNION ALL SELECT 'E'
) r
CROSS JOIN (
    SELECT 1 AS seat_number
    UNION ALL SELECT 2
    UNION ALL SELECT 3
    UNION ALL SELECT 4
    UNION ALL SELECT 5
    UNION ALL SELECT 6
    UNION ALL SELECT 7
    UNION ALL SELECT 8
    UNION ALL SELECT 9
    UNION ALL SELECT 10
) n;
