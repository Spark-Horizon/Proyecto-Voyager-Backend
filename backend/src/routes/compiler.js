const express = require('express');

const { submit } = require('../helpers/submit');
const { PythonPromiseFactory } = require('../helpers/jobe/test_suite/PythonPromise');

const router = express.Router();

const IP_SERVER = process.env.IP;
console.log(IP_SERVER)
const pool = require('../../db/index');

router.get('/', (req, res) => {
    res.send('compiler route working')
})

/* PROBLEM endpoint
    Retrieves information about an specific problem and responds to 
    the client with that data. It also saves data in the cache in order
    to reduce the amount of querys.
*/
router.get('/problem/:id_problem', async (req, res) => {
    let id = req.params.id_problem
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT archivo FROM ejercicios WHERE id = $1', [id])
        if (result.rows[0] != null) {
            res.status(200).json(result.rows[0])
        } else {
            res.status(500).json({ "error": "Problem id no valido" })
        }
        client.release();
    } catch (err) {
        console.log(err);
        res.status(500).send(err)
    }

    /* Database query - replace 0 with data retrieved from the query
        Use id_problem to retrieve specific information about a problem
    */
})


/* RUN endpoint 
    This request only sends the code to the compiler and returns the
    code output or errors, it doesn't save the code data on the
    database.
*/

router.post('/problem/run', async (req, res) => {
    // console.log(req.body);
    if (!req.body || Object.keys(req.body).length === 0) { 
        return res.status(300).send('Body data is undefined');
    }

    const { code, driver, tests } = req.body;


    let promiseFactory = new PythonPromiseFactory()
    let pythonPromise;
    // Defining which type of promise will be resolved
    if (driver) {
        // El resto del código se mantiene igual...
    } else {
        console.log("noDriver");
        pythonPromise = promiseFactory.createPromise(null, tests, driver, `http://${IP_SERVER}/jobe/index.php/restapi/runs/`, 'POST', code)
        pythonPromise.defineInputs();
        try {
            const responses = await Promise.all(pythonPromise.getPromiseArray);
            const results = {
              cmpinfo: '',
              stdout: '',
              stderr: ''
            };
          
            for (const response of responses) {
              const { cmpinfo, stdout, stderr } = response.data;
              results.cmpinfo += cmpinfo || '';
              results.stdout += stdout || '';
              results.stderr += stderr || '';
            }
          
            const testsInfo = pythonPromise.getTestsInfo(responses, tests);
          
            res.send({
              results,
              testsInfo
            });
        } catch (error) {
            console.log(error);
        }
    }

    /* Compiler output
        The compiler can throw diferent types of output:
        - compinfo
            - Information about the compiler i.e. syntax erros.
        - stdout
            - The main output of the test suite.
        - stderr
            - Errors occured inside the test suite.
    */
})


/* SUBMIT endpoint
    The main difference with the RUN request is that this petition
    saves the code on the database so that the professor can grade
    it.
*/
router.post('/problem/:id_problem/submit', async () => {
    const body = req.body;
    const { code, testCases } = body;

    if (code === "")
        return res.send('No code to execute!')

    const suite = createTestSuite(code, testCases);
    const data = await submit(suite);

    // Parse compiler output

    // Save submission data to database

    // Save code to database

    // Redirect to succesful submission page

    return res.send(data)
})


module.exports = router;
