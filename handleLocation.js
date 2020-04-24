'use strict';


const superagent = require('superagent');
const pg = require('pg');
const client = new pg.Client(process.env.DATABASE_URL);
client.connect();

module.exports = handleLocation;

function handleLocation(request, response) {
  let city = request.query.city;
  let SQL = 'SELECT * FROM location WHERE search_query =$1;';
  let VALUES = [city];
  try {
    client.query(SQL, VALUES)
      .then(result => {
        if(result.rows.length > 0){
          response.status(200).json(result.rows[0]);
        }else{
          getLocation(request, response);
        }
      });
  } catch(err) {
    let errorObject = {
      status: 500,
      responseText: 'Get help',
    };
    response.status(500).json(errorObject);
  }
}

function getLocation(request, response) {
  let city = require.query.city;
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
      const SQL = `
      INSERT INTO locations (search_query, formatted_query, latitude, longitude)
      VALUES($1, $2, $3, $4);`;

      let VALUES = [city, location.formatted_query, location.latitude, location.longitude];
      client.query(SQL, VALUES);
    });
}

function Location(city, data) {
  this.search_query = city;
  this.formatted_query = data.display_name;
  this.latitude = data.lat;
  this.longitude = data.lon;
}

