DROP TABLE IF EXISTS addedMovie;

CREATE TABLE IF NOT EXISTS addedMovie(
    id SERIAL PRIMARY KEY,
    title  VARCHAR(255),
    release_date INT,
    poster_path VARCHAR(500),
    overview VARCHAR(1000)
);