const express = require('express');
const router = express.Router();
const pool = require('../../db/index');

router.get('/', (req, res) => {
    res.send('users route working')
})

module.exports = router;