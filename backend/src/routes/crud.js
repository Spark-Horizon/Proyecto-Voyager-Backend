const express = require('express');

const router = express.Router();

const pool = require('../../db/index');

router.get('/', (req, res) => {
    res.send('crud route working')
})

router.get('/:fil1/:fil2/:fil3/:fil4/:fil5/:order/:hier', async (req, res) => {
    let fil1 = req.params.fil1 === 'X' ? [] : req.params.fil1.split(',');
    let fil2 = req.params.fil2 === 'X' ? [] : req.params.fil2.split(',');
    let fil3 = req.params.fil3 === 'X' ? [] : req.params.fil3.split(',');
    let fil4 = req.params.fil4 === 'X' ? [] : req.params.fil4.split(',');
    let fil5 = req.params.fil5 === 'X' ? [] : req.params.fil5.split(',');
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

router.get('/filter/autor', async (req, res) => {
    
    try {
        const client = await pool.connect();
        const result = await client.query(`SELECT DISTINCT archivo->>'author' FROM ejercicios;`);
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

router.get('/filter/subtema', async (req, res) => {
    
    try {
        const client = await pool.connect();
        const result = await client.query(`SELECT DISTINCT s.nombre, e.id_subtema FROM ejercicios e JOIN subtemas s ON e.id_subtema = s.id;`);
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

router.get('/filter/tipo', async (req, res) => {
    
    try {
        const client = await pool.connect();
        const result = await client.query(`SELECT DISTINCT tipo FROM ejercicios;`);
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

router.get('/filter/dificultad', async (req, res) => {
    
    try {
        const client = await pool.connect();
        const result = await client.query(`SELECT DISTINCT archivo->>'difficulty' FROM ejercicios;`);
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

router.get('/filter/autorizacion', async (req, res) => {
    
    try {
        const client = await pool.connect();
        const result = await client.query(`SELECT DISTINCT autorizado FROM ejercicios;`);
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

router.delete('/delete/:id', async (req, res) => {
    let id = req.params.id
    try {
        const client = await pool.connect();
        const result = await client.query(`DELETE FROM ejercicios WHERE id = $1`, [id]);
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

router.post('/create/code/:autorizado/:tipo/:subtema/:author/:title/:description/:difficulty/:driver/:tests', async (req, res) => {
    let autorizado = req.params.autorizado;
    let tipo = req.params.tipo;
    let subtema = req.params.subtema.split(',');
    let author = req.params.author;
    let title = req.params.title;
    let description = req.params.description;
    let difficulty = req.params.difficulty;
    let driver = req.params.driver;
    let tests = req.params.tests;

    try {

        const jsonData = {
            "author": author,
            "title": title,
            "description": description,
            "topic": subtema[1],
            "difficulty": difficulty,
            "driver": driver,
            "tests": JSON.parse(tests)
        }

        const jsonString = JSON.stringify(jsonData);

        const client = await pool.connect();
        const result = await client.query(`CALL agregarEjercicio($1, $2, $3, $4)`, [autorizado, tipo, jsonString, subtema[0]]);
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

router.post('/create/om/:autorizado/:tipo/:subtema/:author/:title/:description/:difficulty/:answer/:hints/:options', async (req, res) => {
    let autorizado = req.params.autorizado;
    let tipo = req.params.tipo;
    let subtema = req.params.subtema.split(',');
    let author = req.params.author;
    let title = req.params.title;
    let description = req.params.description;
    let difficulty = req.params.difficulty;
    let answer = req.params.answer;
    let hints = req.params.hints;
    let options = req.params.options;

    try {

        const jsonData = {
            "author": author,
            "title": title,
            "description": description,
            "topic": subtema[1],
            "difficulty": difficulty,
            "answer": answer,
            "hints": hints,
            "options": JSON.parse(options)
        }

        const jsonString = JSON.stringify(jsonData);

        const client = await pool.connect();
        const result = await client.query(`CALL agregarEjercicio($1, $2, $3, $4)`, [autorizado, tipo, jsonString, subtema[0]]);
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

router.put('/update/code/:id/:autorizado/:tipo/:subtema/:author/:title/:description/:difficulty/:driver/:tests', async (req, res) => {
    let id = req.params.id;
    let autorizado = req.params.autorizado;
    let tipo = req.params.tipo;
    let subtema = req.params.subtema.split(',');
    let author = req.params.author;
    let title = req.params.title;
    let description = req.params.description;
    let difficulty = req.params.difficulty;
    let driver = req.params.driver;
    let tests = req.params.tests;

    console.log('pues aca si llegue wtf pero en codigo');

    try {

        const jsonData = {
            "author": author,
            "title": title,
            "description": description,
            "topic": subtema[1],
            "difficulty": difficulty,
            "driver": driver,
            "tests": JSON.parse(tests)
        }

        const jsonString = JSON.stringify(jsonData);

        const client = await pool.connect();
        const result = await client.query(`CALL actualizarEjercicio($1, $2, $3, $4, $5)`, [id, autorizado, tipo, jsonString, subtema[0]]);
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

router.put('/update/om/:id/:autorizado/:tipo/:subtema/:author/:title/:description/:difficulty/:answer/:hints/:options', async (req, res) => {
    let id = req.params.id;
    let autorizado = req.params.autorizado;
    let tipo = req.params.tipo;
    let subtema = req.params.subtema.split(',');
    let author = req.params.author;
    let title = req.params.title;
    let description = req.params.description;
    let difficulty = req.params.difficulty;
    let answer = req.params.answer;
    let hints = req.params.hints;
    let options = req.params.options;

    console.log('pues aca si llegue wtf');

    try {

        const jsonData = {
            "author": author,
            "title": title,
            "description": description,
            "topic": subtema[1],
            "difficulty": difficulty,
            "answer": answer,
            "hints": hints,
            "options": JSON.parse(options)
        }

        const jsonString = JSON.stringify(jsonData);

        const client = await pool.connect();
        const result = await client.query(`CALL actualizarEjercicio($1, $2, $3, $4, $5)`, [id, autorizado, tipo, jsonString, subtema[0]]);
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

module.exports = router;