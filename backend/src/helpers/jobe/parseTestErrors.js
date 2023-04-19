const parseStderr = (errString) => {
    let errorData = [];

    const testPattern = /\b(FAIL:).+/g;
    const failedTests = errString.match(testPattern);

    const errPattern = /----------------------------------------------------------------------\nTraceback(.+\s)+\n/g;
    const assertionErrors = errString.match(errPattern);

    failedTests.forEach(ft => {
        console.log(ft)
        errorData.push(
            {
                testFailed: ft,
                cause: null
            }
        );
    });

    for (let i = 0; i < assertionErrors.length; i++) {
        console.log(assertionErrors[i])
        errorData[i]['cause'] = assertionErrors[i];
    }

    console.log(errorData)

    return errorData;
}

exports.parseStderr = parseStderr;