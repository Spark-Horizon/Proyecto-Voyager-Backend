class PythonTestSuite {
    constructor(tests, driver) {
        this._sourceCode = {
            imports: 'import unittest\nimport sys\n',
            code: null,
            classDefinition: 'class TestMyFunctions(unittest.TestCase):\n',
            assertions: null,
            main: "if __name__ == '__main__':\n    loader = unittest.TestLoader()\n    suite = loader.loadTestsFromModule(sys.modules[__name__])\n    runner = unittest.TextTestRunner(verbosity=2)\n    result = runner.run(suite)"
        }
        this._inputs = [];
        this._outputs = [];
        this._tests = tests;
        this._driver = driver;
    }

    defineSourceCode(code) {
        this._sourceCode['code'] = code;
    }

    defineAssertions() {
        let assertions = '';

        if (this._driver == '') {
            this._tests.forEach(test => {
                let { output } = test;
                
                this._outputs.push(output);
            });

            for (let i = 0; i < testInputs.length; i++)
                assertions += `    def test_case_${i}(self):\n        self.assertEqual(main_driver(), ${this._outputs[i]})\n\n    `;
        
            this._sourceCode['assertions'] = assertions;
        } else {
            this._tests.forEach(test => {
                let { input, output } = test;

                this._inputs.push(input);
                this._outputs.push(output);
            })

            for (let i = 0; i < testInputs.length; i++)
                assertions += `    def test_case_${i}(self):\n        self.assertEqual(${this._driver}(${this._inputs}), ${this._outputs[i]})\n\n    `;
            
            this._sourceCode['assertions'] = assertions;
        }
    }

    get getSourceCode() {
        if (this._sourceCode['code'] != null && this._sourceCode['assertions'] != null) {
            const testSuite = Object.values(this._sourceCode).reduce((acc, it) => acc + it, '');

            return testSuite;
        } else {
            return new Error('No code or assertions defined');
        }
    }
}


module.exports = PythonTestSuite;