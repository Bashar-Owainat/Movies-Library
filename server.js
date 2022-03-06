'uss strict';

const express = require("express");
const cors = require('cors')
const movies = require("./MovieData/data.json");
const axios = require("axios");
const dotenv = require("dotenv");
const pg = require('pg');




dotenv.config();
const app = express();
app.use(cors());
const APIKEY = process.env.APIKEY;
const PORT = process.env.PORT;
const DATABASE_URL = process.env.DATABASE_URL;

// Initialize the connection    
// const client = new pg.Client(DATABASE_URL);

const client = new pg.Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

function Movie(id, title, release_date, poster_path, overview) {
    this.id = id;
    this.title = title;
    this.release_date = release_date;
    this.poster_path = poster_path;
    this.overview = overview;

};

//To get the data from the body object
app.use(express.json());

app.get('/', getMoviesHandler);
app.get('/favorite', favoriteHandler);
app.get('/trending', trendingHandler);
app.get('/search', searchMoviesHandler)
app.get('/discover', discoverHandler);
app.get('/similar', similarMoiveHandler);
app.post('/addmovie', addMovieDB);
app.get('/getmovie', getMovieDB)
app.put('/updatecomment/:id', updateCommentDB);
app.get('/getmovie/:id', getMovieDBID);
app.delete('/deletemovie/:id',deleteMovieDB )
app.use('*', notFoundHandler);
app.use(errorHandler);

function getMoviesHandler(req, res) {
    let result = [];


    movies.data.forEach((value) => {
        let aMovie = new Movie(value.title, value.poster_path, value.overview);
        result.push(aMovie);
    });

    return res.status(200).json(result);

};

function favoriteHandler(req, res) {
    return res.send("Welcome to Favorite Page")
}

//function Movie(id, title, release_date, poster_path, overview) 
function trendingHandler(req, res) {
    let results = []
    axios.get(`http://api.themoviedb.org/3/trending/all/week?api_key=${APIKEY}&language=en-US`)
        .then(getResponse => {
            console.log(getResponse)
            getResponse.data.results.map(value => {
                let newMovie = new Movie(value.id, value.title, value.release_date, value.poster_path, value.overview);
                results.push(newMovie);
            })
            return res.status(200).json(results);
        }).catch(error => {
            errorHandler(error, req, res);
        })
}


function searchMoviesHandler(req, res) {
    let results = [];
    const search = req.query.movie;
    console.log(req);
    axios.get(`https://api.themoviedb.org/3/search/movie?api_key=${APIKEY}&language=en-US&query=${search}`)
        .then(getResponse => {
            getResponse.data.results.map(value => {
                let searchedMovie = new Movie(value.id, value.title, value.release_date, value.poster_path, value.overview);
                results.push(searchedMovie);
            })
            return res.status(200).json(results);
        })
        .catch(error => {
            errorHandler(error, req, res);
        })
}

function discoverHandler(req, res) {
    let results = [];

    axios.get(`https://api.themoviedb.org/3/discover/movie?api_key=${APIKEY}&language=en-US`)
        .then(getResponse => {
            getResponse.data.results.map(element => {
                let discover = new Movie(element.id, element.title, element.release_date, element.poster, element.overview)
                results.push(discover);
            })
            return res.status(200).json(results);
        }).catch(error => {
            errorHandler(error, req, res);
        })
}
//movie id  580489
function similarMoiveHandler(req, res) {
    let results = [];
    let id = req.query.id;
    axios.get(`https://api.themoviedb.org/3/movie/${id}/similar?api_key=${APIKEY}&language=en-US&page=1`)
        .then(getResponse => {
            console.log(getResponse);
            getResponse.data.results.map(value => {
                let similar = new Movie(value.id, value.title, value.release_date, value.poster_path, value.overview)
                results.push(similar);
            })
            return res.status(200).json(results);
        }).catch(error => {
            errorHandler(error, req, res);
        })
}

function addMovieDB(req, res) {
    const movie = req.body;
    console.log(movie);
    const sql = `INSERT INTO addedMovie(title, release_date, poster_path, overview, comment) VALUES($1, $2, $3, $4, $5) RETURNING *`
    const values = [movie.title, movie.release_date, movie.poster_path, movie.overview, movie.comment]
    client.query(sql, values).then((result) => {
        return res.status(201).json(result.rows);
    }).catch((error) => {
        errorHandler(error, req, res);
    });
};

function getMovieDB(req, res){
    const sql = 'SELECT * FROM addedMovie';

    client.query(sql).then((result) => {
        return res.status(200).json(result.rows);
    }).catch((error) =>{
        errorHandler(error, req, res);
    })
}

function updateCommentDB(req, res){
    const id = req.params.id;
    const movie = req.body;
    console.log(id);
    console.log(movie);
    const sql = `UPDATE addedMovie SET title=$1, release_date=$2, poster_path=$3, overview=$4, comment=$5 WHERE id=$6 RETURNING *;`;
    const values = [movie.title, movie.release_date, movie.poster_path, movie.overview, movie.comment, id];
    client.query(sql, values).then((result) =>{
        return res.status(200).json(result.rows);
    }).catch((error) =>{
        return errorHandler(error, req, res);
    })
}

function getMovieDBID(req, res){
    const id = req.params.id;

    const sql = `SELECT * FROM addedMovie where id=$1;`;
    const values = [id] ;
    client.query(sql, values).then((result) => {
        return res.status(200).json(result.rows);
    }).catch((error) => {
        errorHandler(error, req, res);
    })
}

function deleteMovieDB(req, res){
    const id = req.params.id;

    const sql = `DELETE FROM addedMovie WHERE id=$1;`;
    const values = [id];

    client.query(sql, values).then(() => {
        return res.status(204).json({});
    }).catch((error) =>{
        errorHandler(error, req, res);
    })
}

function errorHandler(error, req, res) {
    const err = {
        status: 500,
        message: error
    }
    return res.status(500).send(err);
}

function notFoundHandler(req, res) {
    return res.status(404).send("Not Found");
}

client.connect()
    .then(() => {
        app.listen(PORT, () => {
            console.log("Listening on " + PORT)
        });

    });
