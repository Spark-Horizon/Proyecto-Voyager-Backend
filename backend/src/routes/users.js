const express = require('express');
const router = express.Router();
const pool = require('../../db/index');

// QUERYS
const ADD_STUDENT_PROCEDURE = `CALL agregarEstudiante($1, $2, $3, $4);`;
const ADD_TEACHER_PROCEDURE = `CALL agregarDocente($1, $2, $3, $4)`;

router.get('/', (req, res) => {
    res.send('users route working')
})
router.post('/', async (req, res) => {
    
    const { id, name, lastName1, lastName2, role } = req.body;
    let client;
    let query;

    if (!(id && name && lastName1 && lastName2 && role))
        return res.status(400).json({ error: 'Incomplete Data' });

    // Establish a query based on 'role'
    switch (role) {
        case 'student':
            query = ADD_STUDENT_PROCEDURE;
            break;
        case 'teacher':
            query = ADD_TEACHER_PROCEDURE;
            break;
        default:
            return res.status(404).json({ error: 'Not a valid role' });
        }
                
    // User creation on db using the specified query
    try {
        client = await pool.connect();
        await client.query(query, [id, name, lastName1, lastName2]);
        res.status(201).json({message: 'User added to database successfully'})
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error adding user to database', err);
        res.status(500).json({ error: 'Server Internal Error' })
    } finally {
        client.release();
    }
})

module.exports = router;