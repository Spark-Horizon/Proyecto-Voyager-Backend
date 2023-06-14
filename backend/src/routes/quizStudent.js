const express = require('express');

const router = express.Router();

const pool = require('../../db/index');

//GET QUERYS
const GET_ATTEMPT_EXERCISES_QUERY = `SELECT respuestas.id as id_respuesta, respuestas.id_ejercicio as id, ejercicios.tipo
FROM respuestas
INNER JOIN ejercicios ON respuestas.id_ejercicio = ejercicios.id
WHERE respuestas.id_intento = $1`;

//POST QUERYS

//DELETE QUERYS

//Get exercises id and type from an activity
router.get('/:id_intento', async (req, res) => {
    const params = [req.params.id_intento];
    let client;
    try{
        client = await pool.connect();
        const result = await client.query(GET_ATTEMPT_EXERCISES_QUERY,params);
        res.status(200).json(result.rows);
    }catch (error){
        console.error(error);
    }finally{
        client.release();
    }
});

// busca si ya tiene un intento del quizz sin completar, o crea un intento nuevo para el quizz (depende del user_id)
router.get('/getorset/:matricula/:quiz', async (req, res) => {
    const estudiante_ID = req.params.matricula;
    const quizz_ID = req.params.quiz
    const intentoQuery = `
      SELECT *
      FROM intentos
      WHERE id_estudiante = $1
      AND id_actividad = $2
      AND fin IS NULL
    `;

    let client;

    try {
        client = await pool.connect();

        let result = await client.query(intentoQuery, [estudiante_ID, quizz_ID])
    
        if (result.rows[0] == null) {
            await client.query(`CALL agregarIntento($1, $2);`, [
                estudiante_ID,
                quizz_ID
            ]);

            result = await client.query(intentoQuery, [estudiante_ID, quizz_ID]);
            console.log(result.rows);
        }
        

        if (result.rows[0] != null) {
            res.status(200).json(result.rows);
        } else {
            res.status(500).json({ error: 'Matriculo y/o quiz no validos' });
        }

    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    } finally {
        client.release();
    }
});

module.exports = router;