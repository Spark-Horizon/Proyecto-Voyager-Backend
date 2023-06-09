const express = require('express');

const { submit } = require('../helpers/jobe/submit');
const { createTestSuite } = require('../helpers/jobe/testSuiteCreation');
const { parseStderr } = require('../helpers/jobe/parseTestErrors');

const router = express.Router();


router.get('/', (req, res) => {
    res.send('compiler route working')
})

/* PROBLEM endpoint
    Retrieves information about an specific problem and responds to 
    the client with that data. It also saves data in the cache in order
    to reduce the amount of querys.
*/
router.get('/problem/:id_problem', (req, res) => {
    const id_problem = req.params.id_problem;

    /* Database query - replace 0 with data retrieved from the query
        Use id_problem to retrieve specific information about a problem
    */
    const data = 0;

    return data;
})


/* RUN endpoint 
    This request only sends the code to the compiler and returns the
    code output or errors, it doesn't save the code data on the
    database.
*/
router.post('/problem/:id_problem/run', async (req, res) => {
    const body = req.body;
    const { code, driver, tests } = body;

    if (code == '')
        return res.send('No code to execute!')

    const suite = createTestSuite(code, driver, tests);
    const {compinfo, stdout, stderr} = await submit(suite);

    /* Parse compiler output
        The compiler can throw diferent types of output:
        - compinfo
            - Information about the compiler i.e. syntax erros.
        - stdout
            - The main output of the test suite.
        - stderr
            - Errors occured inside the test suite.
    */
    if (stderr) {
        const parsedError = parseStderr(stderr);

        res.send({
            parsedError
        })
    } else if (compinfo) {
        res.send({
            compinfo
        });
    } else {
        res.send({
            stdout
        })
    }
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