const express = require('express');

const router = express.Router();

const pool = require('../../db/index');

//GET QUERYS
const GET_ATTEMPS_QUERY = 'SELECT * FROM intentos WHERE id_estudiante = $1 AND id_actividad = $2';

//POST QUERYS

//DELETE QUERYS

//Function to get all the attemps from an specific activity and a specific user(Student).
router.get('/:id_student/:id_activity', async (req,res,next) => {
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


module.exports = router;