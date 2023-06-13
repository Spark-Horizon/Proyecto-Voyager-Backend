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

router.get('/teacher/:fil1/:fil2/:fil3/:fil4/:fil5/:order/:hier/:id', async (req, res) => {
    let fil1 = req.params.fil1 === 'X' ? [] : req.params.fil1.split(',');
    let fil2 = req.params.fil2 === 'X' ? [] : req.params.fil2.split(',');
    let fil3 = req.params.fil3 === 'X' ? [] : req.params.fil3.split(',');
    let fil4 = req.params.fil4 === 'X' ? [] : req.params.fil4.split(',');
    let fil5 = req.params.fil5 === 'X' ? [] : req.params.fil5.split(',');
    let order = req.params.order;
    let hier = req.params.hier;
    let id = req.params.id;
    
    try {
        const client = await pool.connect();
        const result = await client.query(`SELECT * FROM obtenerEjerciciosDocente($1, $2, $3, $4, $5, $6) ORDER BY ${order} ${hier}`, [fil1, fil2, fil3, fil4, fil5, id]);
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

router.get('/exercise/:id', async (req, res) => {
    let id = req.params.id;
    
    try {
        const client = await pool.connect();
        const result = await client.query(`SELECT * FROM ejercicios WHERE id = $1`, [id]);
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

router.get('/create/add/random/:tipo/:subtema/:difficulty/', async (req, res) => {
    let tipo = req.params.tipo;
    let subtema = req.params.subtema.split(',');
    let difficulty = req.params.difficulty;
    let id_autor = req.params.id_autor;

    const jsonData = {
        "title": ('Ejercicio aleatorio '+ difficulty + ' de ' + tipo),
        "type": tipo,
        "difficulty": difficulty
    }   

    const jsonString = JSON.stringify(jsonData);

    try {
        const client = await pool.connect();
        const result = await client.query(`SELECT agregarIncluirEjercicio($1, $2, $3::json, $4, $5)`, [false, 'Aleatorio', jsonString, subtema[0], null]);
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

router.post('/update/add/code', async (req, res) => {
    const { id, autorizado, tipo, subtema, author, title, description, difficulty, driver, tests } = req.body;
    let client;

    if (!(id &&tipo && subtema && author && title && description && difficulty && driver && tests))
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
        console.log([autorizado, tipo, jsonString, subtema[0]]);
        const result = await client.query(`SELECT actualizarIncluirEjercicio($1, $2, $3, $4::json, $5)`, [id, autorizado, tipo, jsonString, subtema[0]]);
        res.status(200).json(result.rows);
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error adding exercise to database', err);
        res.status(500).json({ error: 'Server Internal Error' })
    } finally {
        client.release();
    }    
})

router.post('/update/add/om', async (req, res) => {
    const { id, autorizado, tipo, subtema, author, title, description, difficulty, answer, hints, options } = req.body;
    let client;

    if (!(id && tipo && subtema && author && title && description && difficulty && answer && options)){
        return res.status(400).json({ error: 'Incomplete Data' });
    }

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

    console.log(jsonData);

    const jsonString = JSON.stringify(jsonData);

    try {
        client = await pool.connect();
        console.log([id, autorizado, tipo, jsonString, subtema[0]]);
        const result = await client.query(`SELECT actualizarIncluirEjercicio($1, $2, $3, $4::json, $5)`, [id, autorizado, tipo, jsonString, subtema[0]]);
        res.status(200).json(result.rows);
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error updating exercise to database', err);
        res.status(500).json({ error: 'Server Internal Error' })
    } finally {
        client.release();
    }
})

router.post('/update/add/random', async (req, res) => {
    console.log(req.body);
    const { id, tipo, subtema, difficulty } = req.body;
    let client;

    if (!(id && tipo && subtema && difficulty))
        return res.status(400).json({ error: 'Incomplete Data' });

    const jsonData = {
        "title": ('Ejercicio aleatorio '+ difficulty + ' de ' + tipo),
        "type": tipo,
        "difficulty": difficulty
    }

    const jsonString = JSON.stringify(jsonData);

    console.log(jsonData);

    try {
        client = await pool.connect();
        const result = await client.query(`SELECT actualizarIncluirEjercicio($1, $2, $3, $4::json, $5)`, [id, false, 'Aleatorio', jsonString, subtema[0]]);        
        res.status(200).json(result.rows);
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error adding exercise to database', err);
        res.status(500).json({ error: 'Server Internal Error' })
    } finally {
        client.release();
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
        const result = await client.query(`SELECT DISTINCT tipo FROM ejercicios WHERE tipo != 'Aleatorio';`);
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

router.post('/create/code', async (req, res) => {
    
    const { autorizado, tipo, subtema, author, title, description, difficulty, driver, tests, id_autor } = req.body;
    let client;

    if (!(tipo && subtema && author && title && description && difficulty && driver && tests))
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
        console.log([autorizado, tipo, jsonString, subtema[0]]);
        await client.query(`CALL agregarEjercicio($1, $2, $3::json, $4, $5)`, [autorizado, tipo, jsonString, subtema[0], id_autor]);        
        res.status(201).json({message: 'Code exercise added to database successfully'})
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error adding exercise to database', err);
        res.status(500).json({ error: 'Server Internal Error' })
    } finally {
        client.release();
    }
})

router.post('/create/om', async (req, res) => {
    const { autorizado, tipo, subtema, author, title, description, difficulty, answer, hints, options, id_autor } = req.body;
    let client;

    if (!(tipo && subtema && author && title && description && difficulty && answer && options))
        return res.status(400).json({ error: 'Incomplete Data' });

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

    console.log(jsonData);

    const jsonString = JSON.stringify(jsonData);

    try {
        client = await pool.connect();
        console.log([autorizado, tipo, jsonString, subtema[0]]);
        await client.query(`CALL agregarEjercicio($1, $2, $3::json, $4, $5)`, [autorizado, tipo, jsonString, subtema[0], id_autor]);        
        res.status(201).json({message: 'OM exercise added to database successfully'})
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error adding exercise to database', err);
        res.status(500).json({ error: 'Server Internal Error' })
    } finally {
        client.release();
    }
})

router.post('/create/random', async (req, res) => {
    const { tipo, subtema, difficulty, id_autor } = req.body;
    let client;

    if (!(tipo && subtema && difficulty))
        return res.status(400).json({ error: 'Incomplete Data' });

    const jsonData = {
        "title": ('Ejercicio aleatorio '+ difficulty + ' de ' + tipo),
        "type": tipo,
        "difficulty": difficulty
    }

    const jsonString = JSON.stringify(jsonData);

    console.log(jsonData);

    try {
        client = await pool.connect();
        await client.query(`CALL agregarEjercicio($1, $2, $3::json, $4, $5)`, [false, 'Aleatorio', jsonString, subtema[0], id_autor]);        
        res.status(201).json({message: 'Random exercise added to database successfully'})
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

router.put('/update/om', async (req, res) => {
    const { id, autorizado, tipo, subtema, author, title, description, difficulty, answer, hints, options } = req.body;
    let client;

    if (!(id && tipo && subtema && author && title && description && difficulty && answer && options)){
        return res.status(400).json({ error: 'Incomplete Data' });
    }

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

    console.log(jsonData);

    const jsonString = JSON.stringify(jsonData);

    try {
        client = await pool.connect();
        console.log([id, autorizado, tipo, jsonString, subtema[0]]);
        await client.query(`CALL actualizarEjercicio($1, $2, $3, $4::json, $5)`, [id, autorizado, tipo, jsonString, subtema[0]]);   
        res.status(201).json({message: 'OM exercise updated to database successfully'})
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error updating exercise to database', err);
        res.status(500).json({ error: 'Server Internal Error' })
    } finally {
        client.release();
    }
})

router.put('/update/random', async (req, res) => {
    const { id, tipo, subtema, difficulty } = req.body;
    let client;

    if (!(id && tipo && subtema && difficulty))
        return res.status(400).json({ error: 'Incomplete Data' });

    const jsonData = {
        "title": ('Ejercicio aleatorio '+ difficulty + ' de ' + tipo),
        "type": tipo,
        "difficulty": difficulty
    }

    const jsonString = JSON.stringify(jsonData);

    console.log(jsonData);

    try {
        client = await pool.connect();
        await client.query(`CALL actualizarEjercicio($1, $2, $3, $4::json, $5)`, [id, false, 'Aleatorio', jsonString, subtema[0]]);        
        res.status(201).json({message: 'Random exercise added to database successfully'})
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error adding exercise to database', err);
        res.status(500).json({ error: 'Server Internal Error' })
    } finally {
        client.release();
    }
})

module.exports = router;