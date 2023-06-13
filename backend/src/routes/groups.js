const express = require('express');

const router = express.Router();

const pool = require('../../db/index');

//GET QUERYS
const GET_STUDENT_QUERY = `SELECT * FROM grupos g
                       INNER JOIN estudiantes_grupos eg ON g.id = eg.id_grupo
                       WHERE eg.id_estudiante = $1`;
const GET_TEACHER_QUERY = 'SELECT * FROM grupos WHERE id_docente = $1';

//POST QUERYS
const ADD_GROUP_PROCEDURE = `CALL agregarGrupo($1, $2, $3)`;
const ADD_STUDENT_TO_GROUP_PROCEDURE = `CALL agregarEstudianteGrupo($1, $2)`;

// DELETE QUERYS
const DELETE_GROUP_QUERY = 'DELETE FROM grupos WHERE id = $1';
const EXIT_GROUP_QUERY = 'DELETE FROM estudiantes_grupos WHERE id_estudiante = $1 AND id_grupo = (SELECT id FROM grupos WHERE codigo = $2)';

//Route for getting groups from the actual user
//The user could be a student or a teacher
router.get('/:role/:id', async (req, res, next) => {
  const { role, id } = req.params;
  let query;

  if (!(role && role.trim() && id)) return res.status(404).json({ error: 'Incompleted data' });

  switch (role) {
    case 'student':
      query = GET_STUDENT_QUERY;
      break;
    case 'teacher':
      query = GET_TEACHER_QUERY;
      break;
    default:
      return res.status(404).json({ error: 'Not a valid role' });
  }

  try {
    const client = await pool.connect();
    const result = await client.query(query, [id]);
    client.release();
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    //Errors managed by middleware
    next(error);
  }
});


router.post('/', async (req, res) => {
  const { idMateriaGrupo, visibleGrupo, codigoGrupo, user } = req.body;
  let client;

  if (!(user && user.role && user.role.trim())) return res.status(400).json({ error: 'Incomplete Data' });


  const { role, id } = user;

  switch (role) {
    case 'student':
      // Verify if data is present
      if (!codigoGrupo || !id) {
        return res.status(400).json({ error: 'Entry data not valid for student' });
      }

      try {
        client = await pool.connect();
        await client.query(ADD_STUDENT_TO_GROUP_PROCEDURE, [codigoGrupo, id]);
        res.status(201).json({ message: 'Student added to group successfully' });
      } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error adding the student to the group', err);
        res.status(500).json({ error: 'Server Internal Error' });
      } finally {
        client.release();
      }
      break;

    case 'teacher':
      // Verify if data is present
      if (!idMateriaGrupo || !id || typeof visibleGrupo === 'undefined') {
        return res.status(400).json({ error: 'Entry data not valid for teacher' });
      }

      try {
        client = await pool.connect();
        await client.query(ADD_GROUP_PROCEDURE, [visibleGrupo, idMateriaGrupo, id]);
        res.status(201).json({ message: 'Group created successfully' });
      } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error adding the group', err);
        res.status(500).json({ error: 'Server Internal Error' });
      } finally {
        client.release();
      }
      break;

    default:
      return res.status(404).json({ error: 'Not a valid role' });
  }
});


// Route for delete (button to delete a group) if teacher
// Route for delete (button to get out of the group) if student
//The code just works when you want do exit a group as student
router.delete('/:role/:id/:codigo?', async (req, res) => {
  const { id, role, codigo } = req.params;

  // validate parameters
  if (!role || !role.trim() || !id || !id.trim()) {
    return res.status(400).json({ error: 'Incomplete data' });
  }

  let query, message, errorMessage, client, params;
  switch (role) {
    case 'student':
      if (!codigo || !codigo.trim()) {
        return res.status(400).json({ error: 'Group code is required for student' });
      }
      query = EXIT_GROUP_QUERY;
      params = [id, codigo];
      message = 'ABANDONED GROUP SUCCESFULLY';
      errorMessage = 'Error leaving the group';
      break;

    case 'teacher':
      query = DELETE_GROUP_QUERY;
      params = [id];
      message = 'DELETED GROUP SUCCESFULLY';
      errorMessage = 'Error deleting the group';
      break;

    default:
      return res.status(400).json({ error: 'Not a valid role' });
  }

  try {
    client = await pool.connect();
    const result = await client.query(query, params);
    
    if (result.rowCount === 0) {
      res.status(404).json({ error: 'No group found matching the provided parameters' });
    } else {
      res.status(200).json({ message });
    }
  } catch (err) {
    console.error(errorMessage, err);
    res.status(500).json({ error: 'Server Internal Error' });
  } finally {
    if (client) {
      client.release();
    }
  }
});

router.get('/subjects', async (req, res, next) => {
  let client;
  try{
    client = await pool.connect();
    const result = await client.query('SELECT * FROM materias');
    res.status(200).json(result.rows);
  }catch (error){
    console.error(error);
    next(error);
  }finally{
    client.release();
  }
});



module.exports = router;