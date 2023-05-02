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
        for (let i = 0; i < this._tests.length; i++)
            assertions += `    def test_case_${i}(self):\n        self.assertEqual(${this._driver}(${this._inputs[i]}), ${this._outputs[i]})\n\n`;
        
        this._sourceCode['assertions'] = assertions;
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