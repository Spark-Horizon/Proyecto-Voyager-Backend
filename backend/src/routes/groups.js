const express = require('express');

const router = express.Router();

//Route for testing if route is working
router.get('/', (req, res) => {
    res.send('groups route working');
});

//Route for post(button to create a group)
router.post('/', async (req,res) => {
    const {idMateriaGrupo, idDocente} = req.body;
    res.send(`este es el idMateriaGrupo ${idMateriaGrupo} y este es el idDocente ${idDocente}`)
});

module.exports = router;