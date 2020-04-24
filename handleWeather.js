'use strict';

const superagent = require('superagent');

module.exports = handleWeather;

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
