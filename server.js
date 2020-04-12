'use strict';


require('dotenv').config();
const cors = require('cors');
const express = require('express');
const superagent = require('superagent');

const PORT = process.env.PORT;

const app = express();
app.use(cors());


app.get('/location', handleLocation);
app.get('/weather', handleWeather);

function handleLocation( request, response ) {
  try {
    let city = request.query.city;
    const url = 'https://us1.locationiq.com/v1/search.php';
    const queryStringParams = {
      key: process.env.LOCATION_TOKEN,
      q: city,
      format: 'json',
      limit: 1,
    };
    superagent.get(url)
      .query(queryStringParams)
      .then( data => {
        let locationData = data.body[0];
        let location = new Location(city, locationData);
        response.json(location);
      });
  }

  catch(error) {
    let errorObj = {
      status: 500,
      responseText: error,
    };
    response.status(500).json(errorObj);
  }
}

function Location(city, data) {
  this.search_query = city;
  this.formatted_query = data.display_name;
  this.latitude = data.lat;
  this.longitude = data.lon;
}


// Weather


function handleWeather( request, response) {
  try {
    let weatherData = require ('./data/darksky.json');
    let listofDays = [];

    weatherData.daily.data.forEach( day => {
      let weather = new Weather(day);
      listofDays.push(weather);
    });
    response.json(listofDays);
  }
  catch(error) {
    let errorObj = {
      status: 500,
      responseText: error,
    };
    response.status(500).json(errorObj);
  }
}

function Weather(data) {
  this.time = data.time;
  this.forecast = data.summary;
}



app.listen( PORT, () => console.log('Server up on', PORT));
