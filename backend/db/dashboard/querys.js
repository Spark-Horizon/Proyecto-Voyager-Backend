const path = require('path');
const pool = require('../index');

require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// Query for retrieving teacher´s groups
const getGroupsQuery = 'SELECT t1.id, t1.codigo, t1.id_materia, t2.nombre FROM grupos t1 JOIN materias t2 ON t1.id_materia = t2.id WHERE t1.id_docente = $1';
const getStudentsQuery = 'SELECT t1.id, t1.nombre, t1.apellido1, t1.apellido2 FROM estudiantes t1 JOIN estudiantes_grupos t2 ON t1.id = t2.id_estudiante WHERE t2.id_grupo = $1';
const getTotalAttemptsQuery = 'SELECT COUNT(id) FROM intentos WHERE id_estudiante = $1 AND fin IS NOT NULL;';
const getAverageCorrectAnswersQuery = 'SELECT AVG(correctos) AS promedio_correctos FROM intentos WHERE id_estudiante = $1 AND fin IS NOT NULL;';
const getOvercomedSubtopicsQuery = 'SELECT COUNT(id_estudiante) AS subtemas_superados FROM estudiantes_subtemas WHERE superado = true AND id_estudiante = $1;';
const getExercisesProgressQuery = `
SELECT t3.nombre AS nombre_tema,
       ARRAY_AGG(t2.nombre) AS nombres_subtemas,
       ARRAY_AGG(t1.racha_om) AS rachas_om,
       ARRAY_AGG(t1.progreso_om) AS progresos_om,
       ARRAY_AGG(t1.racha_codigo) AS rachas_codigo,
       ARRAY_AGG(t1.progreso_codigo) AS progresos_codigo,
       ARRAY_AGG(t1.superado) AS superados,
       ARRAY_AGG(t2.racha_om) AS rachas_om_requeridos,
       ARRAY_AGG(t2.requeridos_om) AS requeridos_om,
       ARRAY_AGG(t2.racha_codigo) AS rachas_codigo_requeridos,
       ARRAY_AGG(t2.requeridos_codigo) AS requeridos_codigo
FROM estudiantes_subtemas t1
JOIN subtemas t2 ON t1.id_subtema = t2.id
JOIN temas t3 ON t2.id_tema = t3.id
WHERE t1.id_estudiante = $1
GROUP BY t3.nombre;
`;

// Utiliza la variable 'query' en tu programa para ejecutar la consulta en PostgreSQL.


const retrieveData = async (queryValues, query, res) => {
    try {
        const values = queryValues;
        const client = await pool.connect();
        const result = await client.query(query, values);
        if (result.rows != null) {
            res.status(200).json(result.rows);
        } else {
            res.status(500).json({ "error": "Query no valida" });
        }
        console.table(result.rows)
        client.release();
    } catch (error) {
        console.log(error);
    }
}

const retrieveGroups = async (professorId, res) => {
   retrieveData([professorId], getGroupsQuery, res);
}

const retrieveStudents = async (groupId, res) => {
    retrieveData([groupId], getStudentsQuery, res);
}

const retrieveTotalAttempts = async (studentId, res) => {
    retrieveData([studentId], getTotalAttemptsQuery, res);
}

const retrieveAverageCorrectAnswers = async (studentId, res) => {
    retrieveData([studentId], getAverageCorrectAnswersQuery, res);
}

const retrieveOvercomedSubtopics = async (studentId, res) => {
    retrieveData([studentId], getOvercomedSubtopicsQuery, res);
}

const retrieveExercisesProgress = async (studentId, res) => {
    retrieveData([studentId], getExercisesProgressQuery, res);
}

module.exports = {
    retrieveGroups,
    retrieveStudents,
    retrieveTotalAttempts,
    retrieveAverageCorrectAnswers,
    retrieveOvercomedSubtopics,
    retrieveExercisesProgress
};