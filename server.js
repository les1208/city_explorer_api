'use strict';


require('dotenv').config();
const cors = require('cors');
const express = require('express');

const PORT = process.env.PORT;

const app = express();
app.use(cors());

// Test Endpoint
// http://localhost:3000/test
app.get( '/test', (request, response) => {
  const name = request.query.name;
  response.send( `Hello, ${name}` );
});

app.get('/cats', (request, response) => {
  let type = request.query.type;
  let words = '';
  if ( type === 'calico' ) {
    words = 'You are a good person';
  }
  else {
    words = 'We do not have those';
  }

  response.send(words);
});

app.get('/location', handleLocation);

function handleLocation( request, response ) {
  try {
    let city = request.query.city;
    let locationData = require('./data/geo.json');
    let location = new Location(city, locationData[0]);
    // throw 'John is ugly or something';
    response.json(location);
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
app.get('/weather', handleWeather);

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
