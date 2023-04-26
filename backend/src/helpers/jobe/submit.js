/* SUBMIT FUNCTION
    This function submits a post petition to the backend
    so the code can be compiled and parsed.

    This petition returns only data in order to make this function
    more customizable.
*/
const submit = async (url, method, submitData) => {
    try {
        const options = {
            method: method,
            url: url,
            headers: {
                'Content-Type': 'application/json',
            },
            data: submitData
        };          

        console.log('options', options)
        const response = await axios(options);
        console.log('response', response)

        const { data } = response;
        console.log('data', data)


        return data;
    } catch(error) {
        console.log(error)
    }
}

exports.submit = submit;