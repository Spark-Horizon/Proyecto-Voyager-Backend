const axios = require('axios');

const { createTestSuite } = require('./testSuiteCreation');
const { parseStderr } = require('./parseTestErrors');

const code = 'def mock(a, b, c):\n\treturn a + b + c';
const stackOverflow = 'def infinite_recursion(a, b, c): infinite_recursion(a, b, c)';
const drivers = ['mock', 'infinite']
const tests = [
    {
        "input": "1, 2, 3",
        "output": "6"
    },
    {
        "input": "2, 2, 3",
        "output": "10"
    },
    {
        "input": "2, 2, 3",
        "output": "10"
    },
];


const dummySubmit =  async () => {
    try {
        let suite = createTestSuite(code, "mock", tests);

        let data = JSON.stringify({
            "run_spec": {
                maxBodyLength: Infinity,
                "language_id": "python3",
                "sourcecode": suite,
                "input": ""
            }
        });

        const options = {
            method: 'post',
            url: 'http://3.15.39.127/jobe/index.php/restapi/runs/',
            headers: {
                'Content-Type': 'application/json',
            },
            data: data
        };          

        const response = await axios(options);

        const { data: { stdout, stderr } } = response;

        if (stderr) {
            parseStderr(stderr);
        }
    } catch(error) {
        console.log(error);
    }
}

dummySubmit();
