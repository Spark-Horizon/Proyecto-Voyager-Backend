const express = require('express');

const router = express.Router();

const pool = require('../../db/index');

//Route for getting groups from the actual user
//The user could be a student or a teacher
router.get('/:role/:id', async (req, res) => {
  const { role } = req.params;
  if (role === 'student') {
    const { id:id_alumno } = req.params;
    const query = `SELECT * FROM grupos g
               INNER JOIN estudiantes_grupos eg ON g.id = eg.id_grupo
               WHERE eg.id_estudiante = $1`;
    const values = [id_alumno];
    let client;
    try {
      client = await pool.connect();
      const result = await client.query(query, values);//We need to query the query all the groups where the student is
      res.status(200).json(result.rows);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error getting the data' });
    } finally {
      client.release();
    }
  } else if (role === 'teacher') {
    const { id: id_docente } = req.params;
    let client; //Declare the client variable
    try {
      client = await pool.connect();
      const result = await client.query('SELECT * FROM grupos WHERE id_docente = $1', [id_docente]);
      res.status(200).json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error getting the data' });
    } finally {
      client.release();
    }
  } else {
    console.error('Not a valid role');
    res.status(404).json({ error: 'Not a valid role' });
  }
});

//Route for post(button to create a group)
router.post('/', async (req, res) => {
  const { idMateriaGrupo, visibleGrupo, user } = req.body;
  //Checking if all data is present
  if (!idMateriaGrupo || !user.id || typeof visibleGrupo === 'undefined') {
    return res.status(400).json({ error: 'Entry data not valid' });
  }
  let client; //Declare the client variable
  try {
    client = await pool.connect();
    await client.query(`CALL agregarGrupo($1, $2, $3)`, [visibleGrupo, idMateriaGrupo, user.id]);
    res.status(201).json({ message: 'Group created succesfully' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error adding the group', err);
    res.status(500).json({ error: 'Server Internal Error' });
  } finally {
    client.release();
  }
});

// Route for delete
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  if (!id || id === '') {
    return res.status(400).json({ error: 'No id provided' });
  }

  let client; // Declare the client variable
  try {
    client = await pool.connect();
    await client.query('DELETE FROM grupos WHERE id = $1', [id]);
    res.status(200).json({ message: 'Group deleted successfully' });
  } catch (err) {
    console.error('Error deleting the group', err);
    res.status(500).json({ error: 'Server Internal Error' });
  } finally {
    client.release();
  }
});


module.exports = router;