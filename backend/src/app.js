//[Package Imports]
const express = require('express');
const cors = require('cors');
//[File Imports]
const logger = require('./middleware/logger');
const pool = require('../db/index');
const compilerRouter = require('./routes/compiler');
const crudRouter = require('./routes/crud');
const createGroupRouter = require('./routes/groups');
const quizAttempRouter = require('./routes/quizAttemp');
const studentRouter = require('./routes/student');
const teacherRouter = require('./routes/teacher');
const pathRouter = require('./routes/path');
const practicaRouter = require('./routes/practica');
const taskRouter = require('./routes/task');
const usersRouter = require('./routes/users');

//[Dotenv Variables Initialization]
require('dotenv').config();

//[Express Initialization]
const app = express();

//[CORS Configuration]
//TODO: Añadir IP del Front End desplegado sino no conectara
app.use(cors());
/*
var corsOptions = {
  origin: ["http://localhost:3000", "http://localhost", "http://localhost:3001"]
};
app.use(cors(corsOptions));
*/

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
app.use(express.json())

//[Routing Initialization]
app.use('/compiler', compilerRouter);
app.use('/crud', crudRouter);
app.use('/groups', createGroupRouter);
app.use('/quizAttempt', quizAttempRouter);
app.use('/student', studentRouter);
app.use('/teacher', teacherRouter);
app.use('/path', pathRouter);
app.use('/practica', practicaRouter);
app.use('/task', taskRouter);
app.use('/users', usersRouter);

// [ROUTES]
app.get('/', (req, res) => {
  res.send('Hello world :)');
});

//Inicia el servidor solo si este archivo es el punto de entrada principal
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, '0.0.0.0', () => { // Change this in production [IMPORTANT]
    console.log(`Servidor iniciado en el puerto ${PORT}`);
  });
}

module.exports = app;