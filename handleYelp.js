'use strict';

const superagent = require('superagent');

module.exports = handleYelp;


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
