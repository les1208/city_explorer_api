'use strict';

const superagent = require('superagent');

module.exports = handleTrails;

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
