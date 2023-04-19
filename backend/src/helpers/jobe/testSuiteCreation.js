const createTestSuite = (code, driver, tests) => {
    let testInputs = [];
    let testOutputs = [];
    let assertions = "";

    tests.forEach(test => {
        let { input, output } = test;

        testInputs.push(input); 
        testOutputs.push(output);
    });

    for (let i = 0; i < testInputs.length; i++) {
        assertions += `def test_case_${i}(self):\n        self.assertEqual(${driver}(${testInputs[i]}), ${testOutputs[i]})\n\n    `;
    }

    const sourceCode = `import unittest
import sys

${code}

class TestMyFunctions(unittest.TestCase):
    ${assertions}

if __name__ == '__main__':
    loader = unittest.TestLoader()
    suite = loader.loadTestsFromModule(sys.modules[__name__])
    runner = unittest.TextTestRunner(verbosity=2)
    
    result = runner.run(suite)
`;

    return sourceCode;
}

exports.createTestSuite = createTestSuite;