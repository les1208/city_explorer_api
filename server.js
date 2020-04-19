'use strict';

require('dotenv').config();

const cors = require('cors');
const pg = require('pg');
const express = require('express');
const superagent = require('superagent');

//Globals
const PORT = process.env.PORT;
const app = express();
const client = new pg.Client(process.env.DATABASE_URL);

client.connect();
app.use(cors());


//Routes
app.get('/location', handleLocation);
app.get('/weather', handleWeather);
app.get('/trails', handleTrails);
app.get('/movies', handleMovies);
app.get('/yelp', handleYelp);

function handleLocation(request, response) {
  let city = request.query.city;
  const url = 'https://us1.locationiq.com/v1/search.php';
  const queryStringParams = {
    key: process.env.LOCATION_KEY,
    q: city,
    format: 'json',
    limit: 1,
  };
  superagent.get(url)
    .query(queryStringParams)
    .then(data => {
      let locationData = data.body[0];
      let location = new Location(city, locationData);
      response.json(location);
    });
}

function Location(city, data) {
  this.search_query = city;
  this.formatted_query = data.display_name;
  this.latitude = data.lat;
  this.longitude = data.lon;
}

app.get('/location', (request,response) => {

  const SQL = 'SELECT * FROM location';

  client.query(SQL)
    .then( results => {
      if( results.rowCount >= 1 ) {
        response.status(200).json(location);
      }
      else {
        response.status(400).send('Avada Kedavra');
      }
    })
    .catch(err => response.status(500).send(err));
});

app.get('/new', (request,response) => {

  let SQL = `
      INSERT INTO location (latitude, longitude)
      VALUES($1, $2)
    `;

  let VALUES = [request.query.latitude, request.query.longitude];

  client.query(SQL, VALUES)
    .then( results => {
      if ( results.rowCount >= 1 ) {
        response.status(301).redirect('https://us1.locationiq.com/v1/search.php');
      }
      else {
        response.status(200).send('Nada');
      }
    })
    .catch(err => response.status(500).send(err));

});



// Weather forecast
function handleWeather(request, response) {
  const weatherUrl = 'https://api.darksky.net/forecast/';
  let key = process.env.DARKSKY_KEY;
  let lat = request.query.latitude;
  let lon = request.query.longitude;
  let newWeathUrl = `${weatherUrl}${key}/${lat},${lon}`;

  superagent.get(newWeathUrl)
    .then(data => {
      let weatherData = data.body.daily.data.map(day => {
        return new Weather(day);
      });
      response.status(200).json(weatherData);
    });
}

function Weather(data) {
  this.time = data.time;
  this.forecast = data.summary;
}

//Hiking Trails

function handleTrails(request, response) {
  const trailsUrl = 'https://www.hikingproject.com/data/get-trails/';
  const queryStringParams = {
    key: process.env.HIKING_KEY,
    lat: request.query.latitude,
    lon: request.query.longitude,
    maxResult: 10,
  };

  superagent.get(trailsUrl)
    .query(queryStringParams)
    .then(data => {
      let trailList = data.body.trails.map(trail => {
        return new HikingTrails(trail);
      });
      response.status(200).json(trailList);
    });
}

function HikingTrails(trail) {
  this.name = trail.name;
  this.location = trail.location;
  this.length = trail.length;
  this.stars = trail.stars;
  this.star_votes = trail.starVotes;
  this.summary = trail.summary;
  this.trail_url = trail.url;
  this.conditions = trail.conditionDetails;
  this.condition_date = trail.conditionDate.substring(0, 10);
  this.condition_time = trail.conditionDate.substring(11, 20);
}

//Get Movies
function handleMovies(request, response) {
  let key = process.env.MOVIE_KEY;
  let region = request.query.search_query;
  const url = `https://api.themoviedb.org/3/search/movie?api_key=${key}&query=${region}&$include_adult=false`;
  superagent.get(url)
    .then(data => {
      let movieData = data.body.results.map( movie => {
        return new Movie(movie);
      });
      response.status(200).json(movieData);
    });
}

function Movie(movie) {
  this.title = movie.title;
  this.overview = movie.overview;
  this.average_votes = movie.vote_average;
  this.total_votes = movie.vote_count;
  this.image_url = 'https://image.tmdb.org/t/p/w500' + movie.poster_path;
  this.popularity = movie.popularity;
  this.released_on = movie.release_date;
}

// Get Restaurants
function handleYelp(request, response) {
  const url = `https://api.yelp.com/v3/businesses/search?location=${request.query.search_query}`;
  console.log('new restaurants');
  try {
    superagent.get (url)
      .set('Authorization', `Bearer ${process.env.YELP_KEY}`)
      .then( data => {
        let restaurantData = data.body.businesses.map( restaurant => new Yelp(restaurant));
        response.status(200).send(restaurantData);
      });
  } catch(err){
    let errObject = {
      status: 500,
      responseText: 'Contact Support',
    };
    response.status(500).json(errObject);
  }
}

function Yelp(restaurant) {
  this.name = restaurant.name;
  this.image_url = restaurant.image_url;
  this.price = restaurant.price;
  this.rating = restaurant.rating;
  this.url = restaurant.url;
}

app.listen(PORT, () => console.log('Server up on', PORT));
