/*
    TODO:
    - Hacer peticiones por cada testcase en caso de que no haya driver
    - Formatear correctamente la respuesta del server al frontend
*/

class PythonTestSuite {
    constructor(tests, driver) {
        this._sourceCodeDriver = {
            imports: 'import unittest\nimport sys\n',
            code: null,
            classDefinition: '\nclass TestMyFunctions(unittest.TestCase):\n',
            assertions: null,
            main: "if __name__ == '__main__':\n    loader = unittest.TestLoader()\n    suite = loader.loadTestsFromModule(sys.modules[__name__])\n    runner = unittest.TextTestRunner(verbosity=2)\n    result = runner.run(suite)"
        };
        this._sourceCodeNoDriver = '';
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
        };
        this._promisesArray = [];
    }

    defineSourceCode(code, driver) {
        driver
            ? this._sourceCodeDriver['code'] = code
            : this._sourceCodeNoDriver = code
    }

    defineInputs() {
        this._tests.forEach(({input:inputTest}) => {
            const parsedInputs = inputTest.replace(/,*/, '\n');

            console.log(parsedInputs)

            this._promisesArray.push(
                {
                    run_spec: {
                        maxBodyLength: Infinity,
                        language_id: 'python3',
                        sourcecode: this._sourceCodeNoDriver,
                        input: parsedInputs
                    }
                }
            )
        });
    }

    defineAssertions() {
        let assertions = '';

        this._tests.forEach(({input, output}) => {
            this._inputs.push(input);
            this._outputs.push(output);
        })

        for (let i = 0; i < this._tests.length; i++)
            assertions += `    def test_case_${i}(self):\n        self.assertEqual(${this._driver}(${this._inputs}), ${this._outputs[i]})\n\n`;
        
        this._sourceCode['assertions'] = assertions;
    }

    get getPromises() {
        if (this._driver === '') {
            return this._promisesArray;
        } else {
            if (this._sourceCode['code'] !== null && this._sourceCode['assertions'] !== null) {    
                const testSuite = Object.values(this._sourceCode).reduce((acc, it) => acc + it, '');
                this._runSpec['run_spec'][sourcecode] = testSuite;
                
                this._promisesArray.push(this._runSpec['run_spec']);

                return this._promisesArray;
            } else {
                if (!this._sourceCode['code'])
                    return new Error('Source code is undefined');
                if (!this._sourceCode['assertions'])
                    return new Error('Assertions are undefined');
            }
        }
    }
}


module.exports = PythonTestSuite;