'use strict';

require('dotenv').config();

const cors = require('cors');
const express = require('express');
const pg = require('pg');

const handleLocation =  require('./handleLocation');
const handleWeather =  require('./handleWeather');
const handleTrails =  require('./handleTrails');
const handleYelp =  require('./handleYelp');
const handleMovies =  require('./handleMovies');

const client = new pg.Client(process.env.DATABASE_URL);
const PORT = process.env.PORT;
const app = express();


client.connect();
app.use(cors());


app.get('/location', handleLocation);
app.get('/weather', handleWeather);
app.get('/trails', handleTrails);
app.get('/movies', handleMovies);
app.get('/yelp', handleYelp);

app.listen(PORT, () => console.log('Server up on', PORT));
