// [IMPORTS]
const express = require('express');
const logger = require('./middleware/logger');
const app = express();

// [DATA BASE CONNECTION]
// For RDS (AWS) database service connection
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

// Try connection
dbClient.connect((err) => {
  if (err) {
    console.error("Error de conexión:", err.stack);
  } else {
    console.log("Conexión exitosa a la base de datos de PostgreSQL a través de RDS");
  }
});

// [MIDDLEWARE]
// Use of a logger
app.use(logger);

// [ROUTES]
app.get('/', (req, res) => {
  const test = {
    message: 'works!'
  }

  res.json(test);
});

// Inicia el servidor solo si este archivo es el punto de entrada principal
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Servidor iniciado en el puerto ${PORT}`);
  });
}

module.exports = app;

