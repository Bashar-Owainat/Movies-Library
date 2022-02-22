'uss strict';

const express = require("express");
const movies = require("./MovieData/data.json");
const axios = require("axios");
const dotenv = require("dotenv");

dotenv.config();
const app = express();
const APIKEY = process.env.APIKEY;
const PORT = process.env.PORT;

function Movie(id, title, release_date,  poster_path, overview) {
    this.id = id;
    this.title = title;
    this.release_date = release_date;
    this.poster_path = poster_path;
    this.overview = overview;

};


app.get('/', getMoviesHandler);
app.get('/favorite', favoriteHandler);
app.get('/trending', trendingHandler);
app.get('/search', searchMoviesHandler)
app.get('/discover', discoverHandler);
app.get('/similar', similarMoiveHandler);

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

function trendingHandler(req, res) {
    let results = []
    axios.get(`http://api.themoviedb.org/3/trending/all/week?api_key=${APIKEY}&language=en-US`)
        .then(getResponse => {
            getResponse.data.results.map(value =>{
                let newMovie = new Movie(value.title, value.poster_path, value.overview);
                results.push(newMovie);
                return res.status(200).json(results);
            })
        }).catch(error =>{
            errorHandler(error, req, res);
        })
}


function searchMoviesHandler(req, res){
    let results = [];
    const search = req.query.movie;
     console.log(req);
    axios.get(`https://api.themoviedb.org/3/search/movie?api_key=${APIKEY}&language=en-US&query=${search}`)
    .then(getResponse =>{
        getResponse.data.results.map(value =>{
            let searchedMovie = new Movie(value.id, value.title, value.release_date, value.poster_path, value.overview);
            results.push(searchedMovie);
        })
        return res.status(200).json(results);
    })
    .catch(error =>{
        errorHandler(error, req, res);
    })
}

function discoverHandler(req, res){
    let results = [];

    axios.get(`https://api.themoviedb.org/3/discover/movie?api_key=${APIKEY}&language=en-US`)
    .then(getResponse =>{
        getResponse.data.results.map(element =>{
            let discover = new Movie(element.id, element.title, element.release_date, element.poster, element.overview)
            results.push(discover);
        })
        return res.status(200).json(results);
    }).catch(error =>{
        errorHandler(error, req, res);
    })
}
//movie id  580489
function similarMoiveHandler(req, res){
    let results = [];
    let id = req.query.id;
    axios.get(`https://api.themoviedb.org/3/movie/${id}/similar?api_key=${APIKEY}&language=en-US&page=1`)
    .then(getResponse =>{
        console.log(getResponse);
        getResponse.data.results.map(value =>{
            let similar = new Movie(value.id, value.title, value.release_date, value.poster_path, value.overview)
            results.push(similar);
        })
        return res.status(200).json(results);
    }).catch(error =>{
        errorHandler(error, req, res);
    })
}

function errorHandler(error, req, res){
    const err ={
        status: 500,
        message: error
    }
    return res.status(500).sent(err);
}


app.listen(PORT, () => {
    console.log("Listening on 3000")
})
