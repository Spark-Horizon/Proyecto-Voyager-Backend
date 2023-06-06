// This function groups the given data array by the 'id_intento' property and returns an object with grouped data.
const groupByAttemptId = (data) => {
    return data.reduce((result, current) => {
        // Check if the 'id_intento' value doesn't exist as a key in the 'result' object.
        if (!result[current.id_intento]) {
            // If it doesn't exist, create a new empty array as the value for that key.
            result[current.id_intento] = [];
        }
        // Push the current data object into the array associated with the 'id_intento' key.
        result[current.id_intento].push(current);
        return result;
    }, {});
}



module.exports = groupByAttemptId;
