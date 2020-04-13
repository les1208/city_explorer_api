'use strict';


require('dotenv').config();
const cors = require('cors');
const express = require('express');
const superagent = require('superagent');
const PORT = process.env.PORT;
const app = express();


//Handler functions
app.use(cors());
app.get('/location', handleLocation);
app.get('/weather', handleWeather);
app.get('/trails', handleTrails);

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


// Weather

function handleWeather(request, response) {
  const weatherUrl = 'https://api.darksky.net/forecast/';
  let key = process.env.DARKSKY_KEY;
  let lat = request.query.latitude;
  let lon = request.query.longitude;
  let newWeath = `${weatherUrl}${key}/${lat},${lon}`;

  superagent.get(newWeath)
    .then(data => {
      let listofDays = data.body.daily.data.map(day => {
        return new Weather(day);
      });
      response.json(listofDays);
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
      response.json(trailList);
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

app.listen(PORT, () => console.log('Server up on', PORT));
