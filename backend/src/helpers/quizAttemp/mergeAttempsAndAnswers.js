const mergeAttemptsAndAnswers = (attempts, answers) => {
    return attempts.map((attempt) => {
        const attemptAnswers = answers.find(answer => answer.id_intento === attempt.id);
        if (attemptAnswers) {
            attempt.answers = attemptAnswers.values;
        } else {
            attempt.answers = [];
        }
        return attempt;
    });
}

module.exports = mergeAttemptsAndAnswers;
