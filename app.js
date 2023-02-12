require("dotenv").config();
const express = require("express");
const cors = require('cors');
const app = express();

app.use(cors());

// Setup your Middleware and API Router here

const bodyParser = require('body-parser');
app.use(bodyParser.json());

const morgan = require('morgan');
app.use(morgan('dev'));

const apiRouter = require('./api');
app.use('/api', apiRouter);

const client = require('./db/client');
client.connect();

module.exports = app;
