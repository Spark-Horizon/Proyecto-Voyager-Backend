const express = require('express');

const router = express.Router();

const pool = require('../../db/index');

//GET QUERYS
const GET_ID_ANSWER_AND_FILE = `SELECT respuestas.id AS respuesta_id, ejercicios.archivo AS ejercicio_archivo
FROM respuestas
JOIN intentos ON respuestas.id_intento = intentos.id
JOIN ejercicios ON respuestas.id_ejercicio = ejercicios.id
WHERE intentos.id = $1;
`;

//POST QUERYS

//DELETE QUERYS

router.get('/getorset/:matricula/:quiz', async (req, res) => {
    const estudiante_ID = req.params.matricula;
    const quizz_ID = req.params.quiz;

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

        let result = await client.query(intentoQuery, [estudiante_ID, quizz_ID]);
        let intentoId;
        
        if (result.rows.length === 0) {
            await client.query(`CALL agregarIntento($1, $2);`, [
                estudiante_ID,
                quizz_ID
            ]);
            
            // Después de crear un nuevo intento, vuelve a consultar para obtenerlo
            result = await client.query(intentoQuery, [estudiante_ID, quizz_ID]);
        }
        
        intentoId = result.rows[1].id; //Esto lo tengo que cambiar por la función de Omar, además de borrar el intento 4 porque interfiere con el 21
        console.log('IntentoId', result.rows);

        // Aquí llamas a GET_ID_ANSWER_AND_FILE independientemente de si el intento existía o se acaba de crear
        console.log('Antes de llamar a la master')
        const resultGet = await client.query(GET_ID_ANSWER_AND_FILE, [intentoId]);
        console.log('ResultGet: ', resultGet.rows)

        if (result.rows.length > 0) {
            res.status(200).json({
                attempt: result.rows,
                answers: resultGet.rows
            });
        } else {
            res.status(500).json({ error: 'Matricula y/o quiz no válidos o no se pudo crear un intento.' });
        }

    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Se produjo un error en el servidor.' });
    } finally {
        client.release();
    }
});


//Get id_answer id and file from the activity/quiz
//useFetchQuizStudent
router.get('/:id_intento', async (req, res) => {
    const params = [req.params.id_intento];
    let client;
    try{
        client = await pool.connect();
        const result = await client.query(GET_ID_ANSWER_AND_FILE,params);
        console.log(result.rows)
        res.status(200).json(result.rows);
    }catch (error){
        console.error(error);
    }finally{
        client.release();
    }
});

// // Endpoint para obtener o establecer un intento de quiz para un estudiante
// router.get('/getorset/:matricula/:quiz', async (req, res) => {
//     // Obtén los parámetros de la ruta
//     const estudiante_ID = req.params.matricula;
//     const quizz_ID = req.params.quiz;

//     // Siempre es bueno validar las entradas
//     // Agrega aquí la validación para estudiante_ID y quizz_ID, si es necesario

//     // Consulta para buscar intentos existentes sin completar
//     const intentoQuery = `
//         SELECT *
//         FROM intentos
//         WHERE id_estudiante = $1
//         AND id_actividad = $2
//         AND fin IS NULL
//     `;

//     let client;

//     try {
//         client = await pool.connect();

//         // Intenta obtener un intento existente sin completar
//         let result = await client.query(intentoQuery, [estudiante_ID, quizz_ID]);

//         // Si no existe un intento, crea uno nuevo
//         if (result.rows.length === 0) {
//             await client.query(`CALL agregarIntento($1, $2);`, [
//                 estudiante_ID,
//                 quizz_ID
//             ]);

//             // Después de crear un nuevo intento, vuelve a consultar para obtenerlo
//             result = await client.query(intentoQuery, [estudiante_ID, quizz_ID]);
//         }

//         // Si la consulta devuelve un resultado, responde con éxito, de lo contrario devuelve un error
//         if (result.rows.length > 0) {
//             res.status(200).json(result.rows);
//         } else {
//             res.status(500).json({ error: 'Matricula y/o quiz no válidos o no se pudo crear un intento.' });
//         }

//     } catch (error) {
//         console.error(error);
//         res.status(500).send({ error: 'Se produjo un error en el servidor.' });
//     } finally {
//         // Siempre libera la conexión al cliente, incluso si hubo un error
//         client.release();
//     }
// });


router.post('/submitRespuesta/', async (req, res) => {
    try {
        const { id_respuesta, answer } = req.body;
        const answerJSON = JSON.parse(answer);
        const correct = answerJSON.correcto;

        const client = await pool.connect();
        const query1 = `CALL actualizarRespuesta($1, $2);`;
        const query2 = `CALL actualizarRespuestaCorrecta($1, $2);`;

        await Promise.all([
            client.query(query1, [id_respuesta, answer]),
            client.query(query2, [id_respuesta, correct])
        ]);

        res.status(200).json({ success: true });
        client.release();
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

router.post('/submitIntento/', async (req, res) => {
    try {
        const { id_intento } = req.body;

        const client = await pool.connect();
        const query = `CALL entregarIntento($1);`;
        const result = client.query(query, [id_intento])

        if (result.rows != null) {
            res.status(200).json(result);
        } else {
            res.status(500).json({ "error": "Query no valida" });
        }

        client.release();
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});


module.exports = router;