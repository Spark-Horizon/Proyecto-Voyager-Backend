const express = require('express');

const router = express.Router();

const pool = require('../../db/index');

//GET QUERYS

//POST QUERYS

//DELETE QUERYS

//Function to get all the attemps from an specific activity and a specific user(Student).
router.get('/', (req,res) => {
    res.send('quizAttemp route working');
});


module.exports = router;