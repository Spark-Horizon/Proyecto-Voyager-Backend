//[Package Imports]
const express = require('express');
const cors = require('cors');
//[File Imports]
const logger = require('./middleware/logger');
const pool = require('../db/index');
const compilerRouter = require('./routes/compiler');
const crudRouter = require('./routes/crud');

//[Express Initialization]
const app = express();

//[CORS Configuration]
//TODO: Añadir IP del Front End desplegado sino no conectara
var corsOptions = {
  origin: ["http://localhost:3000", "http://localhost", "http://localhost:3001"]
};
app.use(cors(corsOptions));

//[Dotenv Variables Initialization]
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

//[Database Test Connection]
pool.connect((err) => {
  if (err) {
    console.error("Error de conexión:", err.stack);
  } else {
    console.log("Conexión exitosa a la base de datos de PostgreSQL a través de RDS");
  }
});

//[MiddleWare Initialization]
app.use(logger)

//[Routing Initialization]
app.use('/compiler', compilerRouter);
app.use('/crud', crudRouter);

app.get('/', (req, res) => {
  res.send('Hello world :)');
});

//Inicia el servidor solo si este archivo es el punto de entrada principal
if (require.main === module) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`Servidor iniciado en el puerto ${PORT}`);
  });
}

module.exports = app;