const express = require('express');

const router = express.Router();

const pool = require('../../db/index');

//Route for testing if route is working
router.get('/', (req, res) => {
    res.send('groups route working');
});

//Route for post(button to create a group)
router.post('/', async (req,res) => {
    const {idMateriaGrupo, idDocente, visibleGrupo} = await req.body; 
    //Checking if all data is present
    if (!idMateriaGrupo || !idDocente || typeof visibleGrupo === 'undefined'){
        return res.status(400).json({ error: 'Entry data not valid'});
    }
    let client; //Declare the client variable
    try{
        console.log(idMateriaGrupo ,typeof(idMateriaGrupo));
        console.log(idDocente ,typeof(idDocente));
        console.log(visibleGrupo ,typeof(visibleGrupo));
        client = await pool.connect();
        // await client.query(`CALL agregargrupo('${visibleGrupo}', '${idMateriaGrupo}', '${idDocente}')`);
        // Comenzar la transacción
        // await client.query('BEGIN');    
        // // Invocar el procedimiento almacenado
        // await client.query(`SELECT agregarGrupo($1, $2, $3)`, [visibleGrupo, idMateriaGrupo, idDocente]);
        // // Hacer commit a la transacción
        // await client.query('COMMIT');
        await client.query(`CALL "agregargrupo"(CAST($1 AS BOOLEAN), CAST($2 AS VARCHAR), CAST($3 AS VARCHAR))`, [visibleGrupo, idMateriaGrupo, idDocente]);
        res.status(201).json({ message: 'Group created succesfully' });
    }catch (err){
        await client.query('ROLLBACK');
        console.error('Error adding the group', err);
        res.status(500).json({ error: 'Server Internal Error' });
    }finally{
        client.release();
    }
});

module.exports = router;