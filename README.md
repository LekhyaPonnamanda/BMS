# BookMyShow-like Application

A simple movie booking application for India supporting Telugu and Hindi movies, built with Spring Boot backend and React frontend.

## Tech Stack

- **Backend**: Java Spring Boot 3.1.5
- **Frontend**: React 18.2.0 + JavaScript + HTML + CSS + Bootstrap 5.2.3
- **Database**: MySQL
- **Build Tool**: Maven

## Features

- Browse movies by city (Hyderabad, Bangalore, Chennai)
- Filter movies by language (Telugu / Hindi)
- View show timings for selected movies
- Book tickets with seat selection
- Mobile responsive UI

## Prerequisites

Before running the application, ensure you have the following installed:

1. **Java JDK 17** or higher
2. **Maven 3.6+**
3. **Node.js 16+** and **npm**
4. **MySQL 8.0+**

## Database Setup

1. Install MySQL and start the MySQL service.

2. Create a database (or it will be created automatically):
   ```sql
   CREATE DATABASE IF NOT EXISTS bookmyshow;
   ```

3. Update database credentials in `backend/src/main/resources/application.properties` if needed:
   ```properties
   spring.datasource.username=root
   spring.datasource.password=your_password
   ```

## Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Build the project using Maven:
   ```bash
   mvn clean install
   ```

3. Run the Spring Boot application:
   ```bash
   mvn spring-boot:run
   ```

   Or if you have an IDE, run the `BookMyShowApplication.java` class.

4. The backend will start on `http://localhost:8080`

5. The application will automatically:
   - Create the database tables
   - Insert sample data from `data.sql`

## Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the React development server:
   ```bash
   npm start
   ```

4. The frontend will start on `http://localhost:3000`

5. Open your browser and navigate to `http://localhost:3000`

## API Endpoints

### Movies
- `GET /api/movies` - Get all movies
- `GET /api/movies?language=TELUGU` - Get movies by language
- `GET /api/movies/{id}` - Get movie by ID

### Theatres
- `GET /api/theatres` - Get all theatres
- `GET /api/theatres?city=Hyderabad` - Get theatres by city
- `GET /api/theatres/{id}` - Get theatre by ID

### Shows
- `GET /api/shows` - Get all shows
- `GET /api/shows?movieId=1&city=Hyderabad` - Get shows by movie and city
- `GET /api/shows/{id}` - Get show by ID

### Bookings
- `GET /api/bookings` - Get all bookings
- `POST /api/bookings` - Create a new booking
  ```json
  {
    "showId": 1,
    "seatsBooked": 2,
    "userName": "John Doe"
  }
  ```
- `GET /api/bookings/{id}` - Get booking by ID

## Database Schema

### Movies Table
- `id` (BIGINT, Primary Key, Auto Increment)
- `name` (VARCHAR, Not Null)
- `language` (ENUM: TELUGU, HINDI, Not Null)
- `genre` (VARCHAR, Not Null)
- `duration` (INT, Not Null) - in minutes

### Theatres Table
- `id` (BIGINT, Primary Key, Auto Increment)
- `name` (VARCHAR, Not Null)
- `city` (VARCHAR, Not Null)

### Shows Table
- `id` (BIGINT, Primary Key, Auto Increment)
- `movie_id` (BIGINT, Foreign Key to movies.id)
- `theatre_id` (BIGINT, Foreign Key to theatres.id)
- `show_time` (DATETIME, Not Null)
- `available_seats` (INT, Not Null)

### Bookings Table
- `id` (BIGINT, Primary Key, Auto Increment)
- `show_id` (BIGINT, Foreign Key to shows.id)
- `seats_booked` (INT, Not Null)
- `user_name` (VARCHAR, Not Null)
- `booking_time` (DATETIME, Not Null) - Auto-generated

## Sample Data

The application comes with sample data including:
- 8 movies (Telugu and Hindi)
- 9 theatres across 3 cities
- Multiple show timings

## Project Structure

```
BookMyShowFrontend/
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/bookmyshow/
│   │   │   │   ├── entity/          # JPA Entities
│   │   │   │   ├── repository/      # JPA Repositories
│   │   │   │   ├── service/         # Business Logic
│   │   │   │   ├── controller/      # REST Controllers
│   │   │   │   └── exception/       # Exception Handlers
│   │   │   └── resources/
│   │   │       ├── application.properties
│   │   │       └── data.sql
│   │   └── test/
│   └── pom.xml
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/              # React Components
│   │   ├── App.js
│   │   ├── App.css
│   │   ├── index.js
│   │   └── index.css
│   └── package.json
└── README.md
```

## Usage Flow

1. **Home Page**: Select a city (Hyderabad, Bangalore, or Chennai) and optionally filter by language
2. **Movie List**: Browse available movies with their details
3. **Show Timings**: View available show timings for the selected movie in your city
4. **Booking**: Enter your name, select number of seats, and confirm booking

## Troubleshooting

### Backend Issues

- **Port 8080 already in use**: Change the port in `application.properties`:
  ```properties
  server.port=8081
  ```

- **Database connection error**: 
  - Verify MySQL is running
  - Check username and password in `application.properties`
  - Ensure database `bookmyshow` exists or can be created

- **Table creation errors**: 
  - Drop existing database and let Spring Boot recreate it
  - Check MySQL version compatibility (requires MySQL 8.0+)

### Frontend Issues

- **Port 3000 already in use**: React will automatically suggest using port 3001
- **API connection errors**: 
  - Ensure backend is running on `http://localhost:8080`
  - Check CORS settings if accessing from different origin

- **npm install fails**: 
  - Clear npm cache: `npm cache clean --force`
  - Delete `node_modules` and `package-lock.json`, then run `npm install` again

## Development Notes

- The application uses Spring Boot's auto-configuration for JPA
- CORS is enabled for `http://localhost:3000` in all controllers
- Exception handling is centralized in `GlobalExceptionHandler`
- The frontend uses React Router for navigation
- Bootstrap 5 is included for responsive design

## License

This is a sample project for educational purposes.

