const express = require('express');
const logger = require('./logger');
const app = express();

app.use(logger);

app.get('/', (req, res) => {
  res.send('Hola mundo');
});

app.listen(3000, () => {
  console.log('Servidor iniciado en el puerto 3000');
});