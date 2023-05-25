const express = require('express');

const router = express.Router();

const pool = require('../../db/index');

router.get('/', (req, res) => {
    res.send('student route working')
})

router.get('/pending/:id', async (req, res) => {
    let id = req.params.id;
    
    try {
        const client = await pool.connect();
        const result = await client.query(`SELECT * FROM obtenerActividadesEstudiante($1)`, [id]);
        if (result.rows != null) {
            res.status(200).json(result.rows);
        } else {
            res.status(500).json({ "error": "Query no valida" });
        }
        client.release();
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
})

module.exports = router;