const express = require('express');

const router = express.Router();

const pool = require('../../db/index');

router.get('/', (req, res) => {
    res.send('path route working')
})

router.get('/materia/:materia/', async (req, res) => {
    let materia_ID = req.params.materia
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT subtemas.id,subtemas.nombre,subtemas.racha,subtemas.requeridos,subtemas.id_tema,temas.nombre AS tema_nombre FROM materias INNER JOIN temas ON materias.id = temas.id_materia INNER JOIN subtemas ON temas.id = subtemas.id_tema WHERE materias.id = $1', [materia_ID])
        if (result.rows[0] != null) {
            res.status(200).json(result.rows)
        } else {
            res.status(500).json({ "error": "Materia_ID no valido" })
        }
        client.release();
    } catch (err) {
        console.log(err);
        res.status(500).send(err)
    }
})

module.exports = router;