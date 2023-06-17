const express = require('express');

const router = express.Router();

const pool = require('../../db/index');

//QUERYS
const GET_ID_ANSWER_AND_FILE = `SELECT respuestas.id AS id_respuesta, tipo, ejercicios.archivo AS ejercicio_archivo
FROM respuestas
JOIN intentos ON respuestas.id_intento = intentos.id
JOIN ejercicios ON respuestas.id_ejercicio = ejercicios.id
WHERE intentos.id = $1 AND respuestas.respuesta IS NULL;
`;

const GET_ID_ATTEMPT_QUERY = `SELECT id
FROM intentos
WHERE id_estudiante = $1
AND id_actividad = $2
AND fin IS NULL
ORDER BY id DESC
LIMIT 1;
`;

const ADD_AND_CONSULT_NEW_ATTEMPT = `SELECT
agregarObtenerIntento($1, $2);
`;

const CALL_actualizarRespuesta = `CALL actualizarRespuesta($1, $2);`;

const CALL_actualizarRespuestaCorrecta = `CALL actualizarRespuestaCorrecta($1, $2);`;

router.get('/getorset/:matricula/:quiz', async (req, res) => {
    const estudiante_ID = req.params.matricula;
    const quizz_ID = req.params.quiz;

    let client;

    try {
        client = await pool.connect();

        let intentoId = await client.query(GET_ID_ATTEMPT_QUERY, [estudiante_ID, quizz_ID]); //Query donde obtenemos su último intento
        intentoId = intentoId.rows[0]?.id; //El intento puede ser undefined
        //Se ocupa el operador de encadenamiento por si no hay registros entonces intentoId sea undefined

        
        if (!intentoId) { //Si no hay intento, entonces creamos uno para ese estudiante y ese quiz y guardamos su id_intento en intentoId
            console.log('No hay intento')
            console.log('A punto de crear intento')
            intentoId = await client.query(ADD_AND_CONSULT_NEW_ATTEMPT,[estudiante_ID,quizz_ID]);
            console.log('Intento creado')
            intentoId = intentoId.rows[0]?.agregarobtenerintento;
            console.log('El nuevo intento id creado es: ', intentoId);
        }

        const resultGet = await client.query(GET_ID_ANSWER_AND_FILE, [intentoId]);
        console.log('ResultGet: ', resultGet.rows)

        if (intentoId) {
            res.status(200).json({
                intento: intentoId,
                respuestas: resultGet.rows
            });
        } else {
            res.status(500).json({ error: 'Matricula y/o quiz no válidos o no se pudo crear un intento.' });
        }

    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Se produjo un error en el servidor.' });
    } finally {
        if (client){
            client.release();
        }
    }
});


router.post('/submitRespuesta/', async (req, res) => {
    let client;
    
});

router.post('/submitIntento/', async (req, res) => {
    let client;
    try {
        const { id_intento } = req.body;
        console.log(id_intento)

        client = await pool.connect();
        const query = `CALL entregarIntento($1);`;
        const result = client.query(query, [id_intento]);
        res.status(200).json({message: `Intento ${id_intento} cerrado con Timestamp`});
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Error interno del servidor" });
    } finally{
        if(client){
            client.release();
        }
    }
});


module.exports = router;