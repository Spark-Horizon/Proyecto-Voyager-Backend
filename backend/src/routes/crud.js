const express = require('express');

const router = express.Router();

const pool = require('../../db/index');

router.get('/', (req, res) => {
    res.send('crud route working')
})

router.get('/:fil1/:fil2/:fil3/:fil4/:fil5/:order/:hier', async (req, res) => {
    let fil1 = req.params.fil1.split(',');
    let fil2 = req.params.fil2.split(',');
    let fil3 = req.params.fil3.split(',');
    let fil4 = req.params.fil4.split(',');
    let fil5 = req.params.fil5.split(',');
    let order = req.params.order;
    let hier = req.params.hier;
    
    try {
        const client = await pool.connect();
        const result = await client.query(`SELECT * FROM obtenerEjercicios($1, $2, $3, $4, $5) ORDER BY ${order} ${hier}`, [fil1, fil2, fil3, fil4, fil5]);
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