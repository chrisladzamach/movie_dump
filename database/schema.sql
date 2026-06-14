CREATE DATABASE IF NOT EXISTS movie_dump CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE movie_dump;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS movies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tmdb_id INT NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  poster_path VARCHAR(255),
  release_date DATE NULL,
  genres JSON,
  overview TEXT,
  cast_data JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS movie_views (
  id INT AUTO_INCREMENT PRIMARY KEY,
  movie_id INT NOT NULL,
  user_id INT NOT NULL,
  watched_at DATE NOT NULL,
  photography_rating TINYINT NOT NULL,
  soundtrack_rating TINYINT NOT NULL,
  screenplay_rating TINYINT NOT NULL,
  cast_rating TINYINT NOT NULL,
  overall_rating DECIMAL(3, 2) NOT NULL,
  observation TEXT,
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_mv_movie FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
  CONSTRAINT fk_mv_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT uq_user_movie UNIQUE (movie_id, user_id),
  CONSTRAINT chk_photo CHECK (photography_rating BETWEEN 0 AND 5),
  CONSTRAINT chk_sound CHECK (soundtrack_rating BETWEEN 0 AND 5),
  CONSTRAINT chk_screen CHECK (screenplay_rating BETWEEN 0 AND 5),
  CONSTRAINT chk_cast CHECK (cast_rating BETWEEN 0 AND 5)
);

CREATE TABLE IF NOT EXISTS watchlist (
  id INT AUTO_INCREMENT PRIMARY KEY,
  movie_id INT NOT NULL,
  user_id INT NOT NULL,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_wl_movie FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
  CONSTRAINT fk_wl_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT uq_watchlist UNIQUE (movie_id, user_id)
);

CREATE TABLE IF NOT EXISTS comments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  movie_id INT NOT NULL,
  user_id INT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_comment_movie FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
  CONSTRAINT fk_comment_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_movie_views_watched_at ON movie_views(watched_at);
CREATE INDEX idx_movie_views_favorite ON movie_views(is_favorite);
CREATE INDEX idx_movies_title ON movies(title);
