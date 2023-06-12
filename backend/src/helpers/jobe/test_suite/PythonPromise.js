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

    getTestsInfo(errString) {
        // console.log('ERRORES', errString);
        let parsedData = [];
    
        // Failed tests regex
        const testPattern = /\b(FAIL:).+/g;
        const failedTests = errString.match(testPattern);
        
        const actualOutputPattern = /: actual_output_(\d+)=(.+)/;
        const actualOutputString = errString.match(actualOutputPattern);

        //Succesful tests regex
        const succesPattern = /\b(test_case_(\d+)) \(__main__\.TestMyFunctions\) \.\.\. ok/g;
        const succesfulTests = errString.match(succesPattern);
    
        // Pattern to get the test index
        const indexPattern = /\d+/g;
        let parsedIndex;


        let testData = {
            index: null,
            passed: null,
            expectedOutput: null,
            actualOutput: null
        }

        if (succesfulTests) {
            // console.log('flag')
            succesfulTests.forEach((st, index) => {
                parsedIndex = parseInt(st.match(indexPattern));
                
                testData['index'] = parsedIndex;
                testData['passed'] = true;
                
                
                parsedData.push({...testData});
            })
        }
        
        if (failedTests) {
            failedTests.forEach((ft, index) => {
                const outputDetails = actualOutputString && actualOutputString[index] ? actualOutputString[index] : 'No error details available';
                const parsedOutput = outputDetails.split('=')[1];

                parsedIndex = parseInt(ft.match(indexPattern));
    
                testData['index'] = parsedIndex;
                testData['passed'] = false;
                testData['expectedOutput'] = this._outputs[parsedIndex];
                testData['actualOutput'] = parsedOutput;

                parsedData.push({...testData});
            });
        }
    
        // Sorting parsed data
        parsedData.sort((a, b) => a.index - b.index);

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
        this._tests.forEach(({input: inputTest}) => {
            let parsedInput;
            if (Array.isArray(inputTest)) {
                parsedInput = this.recursiveJoin(inputTest, '\n');
            } else {
                parsedInput = String(inputTest);
            }
    
            this._runSpec['run_spec']['input'] = parsedInput + '\n'; // Add a new line to the end of input
            this._options['data'] = JSON.stringify(this._runSpec);
    
            this._promises.push(axios(this._options));
        });
    }
    
    recursiveJoin(inputArray, separator) {
        return inputArray.map(item => {
            if (Array.isArray(item)) {
                return this.recursiveJoin(item, separator);
            } else {
                return String(item);
            }
        }).join(separator);
    }
    

    getTestsInfo(responses, tests) {
        return responses.map((response, i) => {
          const stdout = response.data.stdout.replace(/\n$/, ''); // Realiza el reemplazo en la misma línea
          const { output } = tests[i];
      
          const passed = stdout == output; //We use 
          console.log(`Actual output: ${stdout}, Expected output: ${output}`);
      
          return {
            index: i,
            passed,
            expectedOutput: output,
            actualOutput: stdout
          };
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
        
            case null:
                return new PythonPromiseNoDriver(tests, driver, url, method, code);

            default:
                throw new Error('Promise type is not defined.')
        }
    }
}



module.exports = {
    PythonPromiseFactory
};