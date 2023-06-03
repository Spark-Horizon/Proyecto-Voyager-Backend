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
        const result = await client.query(`SELECT * FROM obtenerActividadesGrupo($1) ORDER BY ${order} ${hier}`, [id]);
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

router.get('/activity/:id', async (req, res) => {
    let id = req.params.id;
    
    try {
        const client = await pool.connect();
        const result = await client.query(`SELECT * FROM actividades WHERE id = $1`, [id]);
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

router.get('/activity/:id/exercises', async (req, res) => {
    let id = req.params.id;
    
    try {
        const client = await pool.connect();
        const result = await client.query(`SELECT e.id, e.archivo->>'title', e.tipo, e.id_subtema FROM ejercicios e JOIN actividades_ejercicios ae ON e.id = ae.id_ejercicio WHERE ae.id_actividad = $1`, [id]);
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

router.delete('/activity/:id/delete', async (req, res) => {
    let id = req.params.id
    try {
        const client = await pool.connect();
        const result = await client.query(`DELETE FROM actividades WHERE id = $1`, [id]);
        if (result.rows != null) {
            res.status(200).json(result);
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
    console.log(req.body);
    const { titulo, inicio, fin, intentos, bloqueo, disponible, visible, id_grupo, ejercicios } = req.body;
    let client;

    if (!(titulo && inicio && fin && intentos && id_grupo && ejercicios))
        return res.status(400).json({ error: 'Incomplete Data' });

    try {
        client = await pool.connect();
        await client.query(`CALL agregarActividadConEjercicios($1, $2, $3, $4, $5, $6, $7, $8, $9)`, [titulo, inicio, fin, intentos, bloqueo, disponible, visible, id_grupo, ejercicios]);        
        res.status(201).json({message: 'Activity added to database successfully'})
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error adding activity to database', err);
        res.status(500).json({ error: 'Server Internal Error' })
    } finally {
        client.release();
    }
})

router.put('/update', async (req, res) => {
    const { id, titulo, inicio, fin, intentos, bloqueo, disponible, visible, ejercicios } = req.body;

    let client;

    if (!(id && titulo && inicio && fin && intentos && ejercicios))
        return res.status(400).json({ error: 'Incomplete Data' });
    try {
        client = await pool.connect();
        console.log(id, titulo, inicio, fin, intentos, bloqueo, disponible, visible, ejercicios);
        await client.query(`CALL actualizarActividadConEjercicios($1, $2, $3, $4, $5, $6, $7, $8, $9)`, [id, titulo, inicio, fin, intentos, bloqueo, disponible, visible, ejercicios]);        
        res.status(201).json({message: 'Activity updated to database successfully'})
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error updating activity to database', err);
        res.status(500).json({ error: 'Server Internal Error' })
    } finally {
        client.release();
    }
})

module.exports = router;