const express = require('express');

const router = express.Router();

const pool = require('../../db/index');

router.get('/', (req, res) => {
    res.send('practica route working')
})

router.get('/getorset/:matricula/:subtema/:task_type', async (req, res) => {
    const estudiante_ID = req.params.matricula;
    const subtema_ID = req.params.subtema;
    const task_type = req.params.task_type === 'MO' ? 'Opción múltiple' : 'Código';
    const practicaQuery = `
      SELECT *
      FROM practicas
      WHERE id_estudiante = $1
      AND id_ejercicio IN (
        SELECT id
        FROM ejercicios
        WHERE id_subtema = $2
        AND tipo = $3
      )
      AND (correcto IS NULL)
      LIMIT 1;
    `;

    try {
        const client = await pool.connect();

        let result = await client.query(practicaQuery, [estudiante_ID, subtema_ID, task_type])
    
        if (result.rows[0] == null) {
            const result2 = await client.query(
                `SELECT *
                FROM estudiantes_subtemas
                WHERE id_estudiante = $1
                AND id_subtema = $2`,
                [estudiante_ID, subtema_ID]
            );
            const passedSubtem = result2.rows[0].superado;

            if (passedSubtem) {
                await client.query(`CALL agregarPracticaRandLibre($1, $2, $3);`, [
                    estudiante_ID,
                    subtema_ID,
                    task_type,
                ]);
            } else {
                await client.query(`CALL agregarPracticaRandRuta($1, $2, $3);`, [
                    estudiante_ID,
                    subtema_ID,
                    task_type,
                ]);
            }
            result = await client.query(practicaQuery, [estudiante_ID, subtema_ID, task_type]);
        }
        
        if (result.rows[0] != null) {
            res.status(200).json(result.rows);
        } else {
            res.status(500).json({ error: 'Matriculo y/o subtema no validos' });
        }

        client.release();

    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});


module.exports = router;