//[Package Imports]
const express = require('express');
const cors = require('cors');
//[File Imports]
const logger = require('./middleware/logger');
const pool = require('../db/index');
const compilerRouter = require('./routes/compiler');
const crudRouter = require('./routes/crud');
const dashboardRouter = require('./routes/dashboard');
const createGroupRouter = require('./routes/groups');
const quizAttempRouter = require('./routes/quizAttemp');
const studentRouter = require('./routes/student');
const teacherRouter = require('./routes/teacher');
const pathRouter = require('./routes/path');
const practicaRouter = require('./routes/practica');
const taskRouter = require('./routes/task');
const usersRouter = require('./routes/users');
const quizStudentRouter = require('./routes/quizStudent');

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
app.use('/dashboard', dashboardRouter);
app.use('/groups', createGroupRouter);
app.use('/quizAttempt', quizAttempRouter);
app.use('/student', studentRouter);
app.use('/teacher', teacherRouter);
app.use('/path', pathRouter);
app.use('/practica', practicaRouter);
app.use('/task', taskRouter);
app.use('/users', usersRouter);
app.use('/quizStudent', quizStudentRouter);

// [ROUTES]
app.get('/', (req, res) => {
  res.send('Hello world :)');
});

  const PORT = process.env.PORT
  console.log('A punto de iniciar el servidor en el puerto 3001 que en local es 9050 y la API se comunica a: ', PORT);
  app.listen(3001, '0.0.0.0', () => { // Change this in production [IMPORTANT]
    console.log(`Servidor iniciado en el puerto 3000`);
  });

module.exports = app;