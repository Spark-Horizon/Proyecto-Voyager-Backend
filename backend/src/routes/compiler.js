const express = require('express');

const { submit } = require('../helpers/submit');
const { PythonPromiseFactory } = require('../helpers/jobe/test_suite/PythonPromise');

const router = express.Router();

const IP_SERVER = process.env.IP;
console.log(IP_SERVER)


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
router.post('/problem/run', async (req, res) => {
    // console.log(req.body);
    const { code, driver, tests } = req.body;

    if (!req.body || Object.keys(req.body).length === 0) { 
        return res.status(400).send('Body data is undefined');
    }      

    let promiseFactory = new PythonPromiseFactory()
    let pythonPromise;
    // Defining which type of promise will be resolved
    if (driver !== '') {
        console.log("driver");
        // console.log(tests);
        pythonPromise = promiseFactory.createPromise('driver', tests, driver, `http://${IP_SERVER}/jobe/index.php/restapi/runs/`, 'POST', code)
        pythonPromise.defineAssertions();

        //Array that holds the info for the tests
        const testsInfo = [];

        try {
            /* PYTHON CODE WITH DRIVER
                When driver's name is given, a test suite will be generated. This test suite uses the standard error output so the code can be easily pruned.
            */ 
            const response = await pythonPromise.getPromise;
            const { cmpinfo, stdout, stderr } = response.data;
            // console.log({"Compiler Info:": cmpinfo, "Standard Output:": stdout, "Standard Error:": stderr});

            res.send(
                {
                    cmpinfo,
                    stdout,
                    stderr,
                    testsInfo: pythonPromise.getTestsInfo(stderr)
                }
            )
        } catch (error) {
            console.log(error);
        }
    } else {
        console.log("noDriver");
        pythonPromise = promiseFactory.createPromise('noDriver', tests, driver, `http://${IP_SERVER}/jobe/index.php/restapi/runs/`, 'POST', code)
        pythonPromise.defineInputs();
        try {
            //Array to store the final results
            const results = [];
            // console.log(pythonPromise.getPromiseArray);
            const responses = await Promise.all(pythonPromise.getPromiseArray);
            //Array to store the testsInfo
            const testsInfo = pythonPromise.getTestsInfo(responses, tests);
            // console.log(`responses are: ${JSON.stringify(responses[0].data['stdout'])}`);
            // console.log(`responses are: ${JSON.stringify(responses[0].data)}`);
            // console.log(responses[0].data);
            // console.log(responses[1].data);
            // console.log(responses[2].data);

            for (const response of responses) {
                let { cmpinfo, stdout, stderr } = response.data;
                // console.log({cmpinfo, stdout, stderr});
                results.push({cmpinfo, stdout, stderr});
            }

            res.send(
                {
                    results,
                    testsInfo
                }
            );
        } catch (error) {
            console.log(error)
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
