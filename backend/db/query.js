const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const dbClient = new Client({
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: process.env.PGPORT
})

const express = require('express');
const router = express.Router();


dbClient.connect();

dbClient.query('SELECT * FROM ejercicios', (err, res) => {
  if (err) throw err;
  console.log(res.rows);
  dbClient.end();
});