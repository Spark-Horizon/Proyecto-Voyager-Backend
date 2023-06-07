const express = require('express');

const router = express.Router();

const pool = require('../../db/index');

//GET QUERYS
const GET_EXERCISES_QUERY = `SELECT ejercicios.id, ejercicios.tipo
FROM ejercicios
INNER JOIN actividades_ejercicios
ON ejercicios.id = actividades_ejercicios.id_ejercicio
WHERE actividades_ejercicios.id_actividad = $1`;

//POST QUERYS

//DELETE QUERYS

//Get exercises id and type from an activity
router.get('/:id_activity', async (req, res) => {
    const params = [req.params.id_activity];
    let client;
    try{
        client = await pool.connect();
        const result = await client.query(GET_EXERCISES_QUERY,params);
        res.status(200).json(result.rows);
    }catch (error){
        console.error(error);
    }finally{
        client.release();
    }
});

module.exports = router;