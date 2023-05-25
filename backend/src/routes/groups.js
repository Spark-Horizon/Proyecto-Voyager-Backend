const express = require('express');

const router = express.Router();

const pool = require('../../db/index');

const GET_STUDENT_QUERY = `SELECT * FROM grupos g
                       INNER JOIN estudiantes_grupos eg ON g.id = eg.id_grupo
                       WHERE eg.id_estudiante = $1`;
const GET_TEACHER_QUERY = 'SELECT * FROM grupos WHERE id_docente = $1';

//Route for getting groups from the actual user
//The user could be a student or a teacher
router.get('/:role/:id', async (req, res, next) => {
  const { role, id } = req.params;
  let query;

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
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    //Errors managed by middleware
    next(error);
  }
});

//Route for post(button to create a group) if teacher
//Route for post(button to enter to a group) if student
//To enter to a group we need to call the procedure agregarEstudianteGrupo(IN codigo_grupo TEXT, IN id_estudiante_nuevo VARCHAR(10))
//Teacher JSON for post:
// {
//   "idMateriaGrupo": "TC1028",
//   "visibleGrupo": true,
//   "user" : {
//   "id": "L01732005",
//   "name": "Francisco",
//   "lastname1": "Rocha",
//   "lastname2": "Juárez",
//   "role": "teacher"
//   }
// }
//Student JSON for post:
//{
//  "codigoGrupo": "DEE8C67B",
//   "user" : {
//   "id": "A01732007",
//   "name": "Francisco",
//   "lastname1": "Rocha",
//   "lastname2": "Juárez",
//   "role": "student"
//   }
//}

// router.post('/', async (req, res) => {
//   switch (role){
//     case 'student':
//       //Instructions
//       break;
//     case 'teacher':
//       //Instructions
//       break;
//     default:
//       return res.status(404).json({ error: 'Not a valid role' })
//   }
//   const { idMateriaGrupo, visibleGrupo, user } = req.body;
//   //Checking if all data is present
//   if (!idMateriaGrupo || !user.id || typeof visibleGrupo === 'undefined') {
//     return res.status(400).json({ error: 'Entry data not valid' });
//   }
//   let client; //Declare the client variable
//   try {
//     client = await pool.connect();
//     await client.query(`CALL agregarGrupo($1, $2, $3)`, [visibleGrupo, idMateriaGrupo, user.id]);
//     res.status(201).json({ message: 'Group created succesfully' });
//   } catch (err) {
//     await client.query('ROLLBACK');
//     console.error('Error adding the group', err);
//     res.status(500).json({ error: 'Server Internal Error' });
//   } finally {
//     client.release();
//   }
// });

// Route for delete (button to delete a group) if teacher
//Route for delete (button to get out of the group) if student
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