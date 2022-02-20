'uss strict';

const express = require("express");
const movies = require("./MovieData/data.json");

const app = express();

function Movie(title, poster_path, overview) {
    this.title = title;
    this.poster_path = poster_path;
    this.overview = overview;

};


app.get('/', getMoviesHandler);
app.get('/favorite', favoriteHandler);


function getMoviesHandler(req, res) {
    let result = [];


    movies.data.forEach((value) =>{
        let aMovie = new Movie(value.title, value.poster_path, value.overview);
        result.push(aMovie);
    });

    return res.status(200).json(result);

};

function favoriteHandler(req, res){
    return res.send("Welcome to Favorite Page")
}



app.listen(3000, () => {
    console.log("Listening on 3000")
})
