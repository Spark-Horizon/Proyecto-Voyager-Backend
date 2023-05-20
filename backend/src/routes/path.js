const express = require('express');

const router = express.Router();

const pool = require('../../db/index');

router.get('/', (req, res) => {
    res.send('path route working')
})

router.get('/materia/:materia/', async (req, res) => {
    let materia_ID = req.params.materia
    try {
        const client = await pool.connect()
        const result = await client.query(`
        SELECT subtemas.id, subtemas.nombre, subtemas.id_tema, temas.nombre AS tema_nombre
        FROM materias
        INNER JOIN temas ON materias.id = temas.id_materia
        INNER JOIN subtemas ON temas.id = subtemas.id_tema
        WHERE materias.id = $1
          AND subtemas.id >= (SELECT MIN(id_subtema) FROM estudiantes_subtemas);
        `, [materia_ID])

        if (result.rows[0] != null) {
            res.status(200).json(result.rows)
        } else {
            res.status(500).json({ "error": "Materia_ID no valido" })
        }
        client.release()
    } catch (err) {
        console.log(err)
        res.status(500).send(err)
    }
})

router.get('/unlocked/:matricula/:materia/', async (req, res) => {
    let estudiante_ID = req.params.matricula
    let materia_ID = req.params.materia
    try {
        const client = await pool.connect()
        const result = await client.query(`
        SELECT estudiantes_subtemas.id_subtema, estudiantes_subtemas.superado
        FROM estudiantes_subtemas
        INNER JOIN subtemas ON estudiantes_subtemas.id_subtema = subtemas.id
        INNER JOIN temas ON subtemas.id_tema = temas.id
        WHERE temas.id_materia = $1
          AND id_estudiante = $2;
        `, [materia_ID, estudiante_ID])

        if (result.rows[0] != null) {
            res.status(200).json(result.rows)
        } else {
            res.status(500).json({ "error": "Matriculo y/o materia no validos" })
        }
        client.release()
    } catch(err){
        console.log(err)
        res.status(500).send(err)
    }
})

router.get('/progress/:matricula/:subtema/', async (req, res) => {
    let estudiante_ID = req.params.matricula
    let subtema_ID = req.params.subtema
    try {
        const client = await pool.connect()
        const result = await client.query(`
        SELECT *
        FROM estudiantes_ejercicios
        WHERE id_estudiante = $1
          AND id_ejercicio IN (
            SELECT id
            FROM ejercicios
            WHERE id_subtema = $2
          )
          AND (correcto = false OR correcto IS NULL)
        LIMIT 1;
        `, [estudiante_ID, subtema_ID])

        if (result.rows[0] != null) {
            res.status(200).json(result.rows)
        } else {
            res.status(500).json({ "error": "Matriculo y/o subtema no validos" })
        }
        client.release()
    } catch(err){
        console.log(err)
        res.status(500).send(err)
    }
})

module.exports = router;