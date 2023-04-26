/* SUBMIT FUNCTION
    This function submits a post petition to the backend
    so the code can be compiled and parsed.

    This petition returns only data in order to make this function
    more customizable.
*/
const submit = async (url, method, data) => {
    try {
        const options = {
            method: method,
            url: url,
            headers: {
                'Content-Type': 'application/json',
            },
            data: data
        };          

        const response = await axios(options);

        const { data } = response;
        console.log('data', data)


        return data;
    } catch(error) {
        return JSON.stringify(error);
    }
}

exports.submit = submit;