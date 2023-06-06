const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const pool = require('../../db/index');

router.get('/', (req, res) => {
    res.send('task route working')
})

router.post('/submitPractica/:id_practice', async (req, res) => {
    let id_practice = req.params.id_practice
    let answer = req.body
    console.log(answer);
    let correct = answer.correcto

    try {
        const client = await pool.connect()
        const result = await client.query(`CALL actualizarPractica($1, $2, $3)`, [id_practice, answer, correct])
        if (result.rows != null) {
            res.status(200).json(result);
        } else {
            res.status(500).json({ "error": "Query no valida" });
        }
        client.release();
    } catch (error) {
        console.log(err);
        res.status(500).send(err);
    }

})

module.exports = router;