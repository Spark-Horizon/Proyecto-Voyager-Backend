const express = require('express');

const { parseStderr } = require('./parseTestErrors');

const submit = async (suite) => {
    try {
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

        const { data: { compinfo, stdout, stderr} } = response;


        return {
            compinfo,
            stdout,
            stderr
        };
    } catch(error) {
        return JSON.stringify(error);
    }
}

exports.submit = submit;