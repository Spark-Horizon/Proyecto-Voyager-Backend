// This function maps attempts with corresponding answers based on their 'id' values.
const mapAttemptsWithAnswers = (attempts, answers) => {
    return attempts.map(attempt => {
        // Assign the answers associated with the current attempt's 'id' value,
        // or an empty array if no answers are found.
        attempt.answers = answers[attempt.id] || [];
        return attempt;
    });
};



module.exports = mapAttemptsWithAnswers;