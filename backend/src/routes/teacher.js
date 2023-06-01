const express = require('express');

const router = express.Router();

const pool = require('../../db/index');

router.get('/', (req, res) => {
    res.send('teacher route working')
})

router.get('/activities/:id/:order/:hier', async (req, res) => {
    let id = req.params.id;
    let order = req.params.order;
    let hier = req.params.hier;
    
    try {
        const client = await pool.connect();
        const result = await client.query(`SELECT * FROM actividades WHERE id_grupo = $1 ORDER BY ${order} ${hier}`, [id]);
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

router.post('/create', async (req, res) => {
    const { titulo, inicio, fin, intentos, bloqueo, disponible, id_grupo, ejercicios } = req.body;
    let client;

    if (!(titulo && inicio &&  fin && intentos && bloqueo && disponible && id_grupo && ejercicios))
        return res.status(400).json({ error: 'Incomplete Data' });

    try {
        client = await pool.connect();
        await client.query(`CALL agregarEjercicio($1, $2, $3::json, $4)`, [titulo, inicio, fin, intentos, bloqueo, disponible, id_grupo, ejercicios]);        
        res.status(201).json({message: 'OM exercise added to database successfully'})
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error adding exercise to database', err);
        res.status(500).json({ error: 'Server Internal Error' })
    } finally {
        client.release();
    }
})

router.put('/update/code', async (req, res) => {
    
    const { id, autorizado, tipo, subtema, author, title, description, difficulty, driver, tests } = req.body;
    let client;

    if (!(id && tipo && subtema && author && title && description && difficulty && driver && tests))
        return res.status(400).json({ error: 'Incomplete Data' });

    const jsonData = {
        "author": author,
        "title": title,
        "description": description,
        "topic": subtema[1],
        "difficulty": difficulty,
        "driver": driver,
        "tests": JSON.parse(tests)
    }

    console.log(jsonData);

    const jsonString = JSON.stringify(jsonData);

    try {
        client = await pool.connect();
        console.log([id, autorizado, tipo, jsonString, subtema[0]]);
        await client.query(`CALL actualizarEjercicio($1, $2, $3, $4::json, $5)`, [id, autorizado, tipo, jsonString, subtema[0]]);    
        res.status(201).json({message: 'Code exercise updated to database successfully'})
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error updating exercise to database', err);
        res.status(500).json({ error: 'Server Internal Error' })
    } finally {
        client.release();
    }
})

module.exports = router;