const express = require('express');
const dashboard = require('../../db/dashboard/querys');

const router = express.Router();

router.get('/profesor/entregas', (req, res) => {
    const professorId = req.query.id;

    dashboard.retrieveGroups(professorId, res);
});

router.get('/profesor/avances', (req, res) => {
    const professorId = req.query.id;

    dashboard.retrieveGroups(professorId, res);
});

router.get('/profesor/avances/estudiantes', (req, res) => {
    const groupId = req.query.groupId;

    dashboard.retrieveStudents(groupId, res);
});

router.get('/profesor/avances/estudiantes/intentos_totales', (req, res) => {
    const studentId = req.query.studentId;

    dashboard.retrieveTotalAttempts(studentId, res);
});

router.get('/profesor/avances/estudiantes/promedio_respuestas_correctas', (req, res) => {
    const studentId = req.query.studentId;

    dashboard.retrieveAverageCorrectAnswers(studentId, res);
});

router.get('/profesor/avances/estudiantes/subtemas_superados', (req, res) => {
    const studentId = req.query.studentId;

    dashboard.retrieveOvercomedSubtopics(studentId, res);
});

router.get('/profesor/avances/estudiantes/progreso_ejercicios', (req, res) => {
    const studentId = req.query.studentId;

    dashboard.retrieveExercisesProgress(studentId, res);
});


module.exports = router;