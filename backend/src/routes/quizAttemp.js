const express = require('express');
const router = express.Router();
const pool = require('../../db/index');
const groupByAttemptId = require('../helpers/quizAttemp/groupByItemId')

//GET QUERYS
const GET_ATTEMPS_QUERY = 'SELECT * FROM intentos WHERE id_estudiante = $1 AND id_actividad = $2';
const GET_ANSWERS_QUERY = `
    SELECT respuestas.id_intento, respuestas.respuesta, respuestas.correcto
    FROM intentos
    LEFT JOIN respuestas
    ON intentos.id = respuestas.id_intento
    WHERE intentos.id_estudiante = $1 AND intentos.id_actividad = $2
    ORDER BY intentos.id_estudiante, intentos.id`;

//POST QUERYS

//DELETE QUERYS

//Function to get all the attemps from an specific activity and a specific user(Student).
router.get('/:id_student/:id_activity/attemps', async (req,res,next) => {
    const { id_student, id_activity } = req.params;
    const VALUES = [id_student, id_activity];
    let client;
    try{
        client = await pool.connect();
        const result = await client.query(GET_ATTEMPS_QUERY, VALUES);
        res.status(200).json(result.rows);
    }catch (error){
        console.error(error);
        next(error); //Errors managed by middleware
    }finally{
        client.release();
    }
});

//Fuction to get the individual answers from each attemp.
//According to the student id and the activity id
router.get('/:id_student/:id_activity/answers', async (req,res,next) => {
    const { id_student, id_activity } = req.params;
    const VALUES = [id_student, id_activity];
    let client;
    try{
        client = await pool.connect();
        const result = await client.query(GET_ANSWERS_QUERY, VALUES);
        const groupedData = groupByAttemptId(result.rows);
        res.status(200).json(groupedData);
    }catch (error){
        console.error(error);
        next(error); //Errors managed by middleware
    }finally{
        client.release();
    }
});

module.exports = router;
