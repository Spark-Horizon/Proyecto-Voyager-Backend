const express = require('express');
const logger = require('./logger');
const app = express();
//For RDS (AWS) database service connection
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { Client } = require('pg');
const dbClient = new Client({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT
})
// try connection
dbClient.connect((err) => {
  if (err) {
    console.error("Error de conexión:", err.stack);
  } else {
    console.log("Conexión exitosa a la base de datos de PostgreSQL a través de RDS");
  }
});

app.use(logger);

app.get('/', (req, res) => {
  const test = {
    message: 'works!'
  }

  res.json(test);
  res.send('works');
});

app.listen(3000, () => {
  console.log('Servidor iniciado en el puerto 3000');
});
