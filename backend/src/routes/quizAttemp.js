const express = require('express');
const router = express.Router();
const pool = require('../../db/index');
const groupByAttemptId = require('../helpers/quizAttemp/groupByItemId');
//const mergeAttemptsAndAnswers = require('../helpers/quizAttemp/mergeAttempsAndAnswers');
const mapAttemptsWithAnswers = require('../helpers/quizAttemp/mapAttempsWithAnswers');

//GET QUERYS
const GET_ACTIVITY_QUERY = 'SELECT * FROM actividades WHERE id = $1';
const GET_ATTEMPS_QUERY = 'SELECT * FROM intentos WHERE id_estudiante = $1 AND id_actividad = $2';
const GET_ANSWERS_QUERY = `
    SELECT respuestas.id_intento, respuestas.respuesta, respuestas.correcto
    FROM intentos
    LEFT JOIN respuestas
    ON intentos.id = respuestas.id_intento
    WHERE intentos.id_estudiante = $1 AND intentos.id_actividad = $2
    ORDER BY intentos.id_estudiante, intentos.id`;

router.get('/:id_student/:id_activity', async (req, res, next) => {
    const { id_student, id_activity } = req.params;
    const VALUES = [id_student, id_activity];
    let client;
    try {
        client = await pool.connect();
        const [activityResult, attemptsResult, answersResult] = await Promise.all([
            client.query(GET_ACTIVITY_QUERY, [id_activity]),
            client.query(GET_ATTEMPS_QUERY, VALUES),
            client.query(GET_ANSWERS_QUERY, VALUES)
        ]);
        const groupedAnswers = groupByAttemptId(answersResult.rows);
        const attempts = mapAttemptsWithAnswers(attemptsResult.rows, groupedAnswers);
        const result = {
            activity: activityResult.rows[0],
            attempts
        };
        res.status(200).json(result);
    } catch (error) {
        console.error(error);
        next(error); //Errors managed by middleware
    } finally {
        client.release();
    }
});


module.exports = router;
