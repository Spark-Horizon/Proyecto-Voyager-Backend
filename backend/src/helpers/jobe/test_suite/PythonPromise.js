const { default: axios } = require("axios");

class PythonPromise {
    constructor(tests, driver, url, method) {
        this._inputs = [];
        this._outputs = [];
        this._tests = tests;
        this._driver = driver;
        this._runSpec = {
            run_spec: {
                maxBodyLength: Infinity,
                language_id: 'python3',
                sourcecode: null,
                input: ""
            }
        }
        this._options = {
            method: method,
            url: url,
            headers: {
                'Content-Type': 'application/json',
            },
            data: null
        };
    }
}

class PythonPromiseDriver extends PythonPromise {
    constructor(_tests, _driver, _url, _method, code) {
        super(_tests, _driver, _url, _method);
        this._sourceCode = {
            imports: 'import unittest\nimport sys\n',
            code: code,
            classDefinition: '\nclass TestMyFunctions(unittest.TestCase):\n',
            assertions: null,
            main: "if __name__ == '__main__':\n    loader = unittest.TestLoader()\n    suite = loader.loadTestsFromModule(sys.modules[__name__])\n    runner = unittest.TextTestRunner(verbosity=2)\n    result = runner.run(suite)"
        }
    }

    defineAssertions() {
        let assertions = '';

        this._tests.forEach(({input, output}) => {
            this._inputs.push(input);
            this._outputs.push(output);
        })

        // Creating assertions
        for (let i = 0; i < this._tests.length; i++){
            assertions += `    def test_case_${i}(self):\n`;
            assertions += `        actual_output_${i} = ${this._driver}(${this._inputs[i]})\n`;
            assertions += `        self.assertEqual(actual_output_${i}, ${this._outputs[i]}, "actual_output_${i}=" + str(actual_output_${i}))\n\n`;
        }        

        this._sourceCode['assertions'] = assertions;
    }

    parseStderr(errString) {
        console.log('ERRORES', errString);
        let parsedData = [];
    
        const testPattern = /\b(FAIL:).+/g;
        const failedTests = errString.match(testPattern);
    
        const errPattern = /Traceback(.+\s)+\n/g;
        const assertionErrors = errString.match(errPattern);
    
        console.log({
            failedTests,
            assertionErrors
        });

        let testData = {
            index: null,
            passed: null,
            input: null,
            expectedOutput: null,
            actualOutput: null
        }
    
        if (failedTests) {
            failedTests.forEach((ft, index) => {
                const errorDetails = assertionErrors && assertionErrors[index] ? assertionErrors[index] : 'No error details available';
                const indexPattern = /\d+/g;
                const parsedIndex = parseInt(ft.match(indexPattern));
    
                testData['index'] = parsedIndex;
                testData['passed'] = false;
                testData['input'] = this._inputs[parsedIndex];
                testData['expectedOutput'] = this._outputs[parsedIndex];

    
                // Traceback (most recent call last):
                // File "/home/jobe/runs/jobe_tigA6t/prog.py", line 13, in test_case_2
                //     self.assertEqual(main_test(3, 2), 6)
                // AssertionError: 5 != 6 < -------

                parsedData = [...parsedData, testData];
            });
        } else {
            // No se encontraron pruebas fallidas, es decir, todas las pruebas pasaron
            
        }
    
        return parsedData;
    }

    get getPromise() {
        if (!this._sourceCode['assertions'])
            throw new Error('Assertions are not defined.')
        
        // Creating test suite
        const testSuite = Object.values(this._sourceCode).reduce((acc, it) => acc + it, '');
        
        // Creating run specification for JOBE
        this._runSpec['run_spec']['sourcecode'] = testSuite;

        // Defining options used by axios
        this._options['data'] = JSON.stringify(this._runSpec);

        // Returning promise
        return axios(this._options);
    }
}

class PythonPromiseNoDriver extends PythonPromise {
    constructor(_tests, _driver, _url, _method, code) {
        super(_tests, _driver, _url, _method);
        this._promises = []
        this._runSpec['run_spec']['sourcecode'] = code;
    }

    defineInputs() {
        this._tests.forEach(({input:inputTest}) => {
            const parsedInput = inputTest.replace(/,*/, '\n');

            this._runSpec['run_spec']['input'] = parsedInput;
            this._options['data'] = JSON.stringify(this._runSpec);

            this._promises.push(axios(this._options));
        });
    }

    get getPromiseArray() {
        return this._promises;
    }
}

class PythonPromiseFactory {
    createPromise(type, tests, driver, url, method, code) {
        switch (type) {
            case 'driver':
                return new PythonPromiseDriver(tests, driver, url, method, code);
        
            case 'noDriver':
                return new PythonPromiseNoDriver(tests, driver, url, method, code);

            default:
                throw new Error('Promise type is not defined.')
        }
    }
}



module.exports = {
    PythonPromiseFactory
};