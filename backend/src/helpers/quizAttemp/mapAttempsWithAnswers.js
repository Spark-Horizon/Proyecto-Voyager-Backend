// This function maps attempts with corresponding answers based on their 'id' values.
const mapAttemptsWithAnswers = (attempts, answers) => {
    return attempts.map(attempt => {
        const attemptAnswers = answers[attempt.id] || [];
        attempt.id_intento = attempt.id;
        delete attempt.id;
        attempt.answers = {
            respuestas: attemptAnswers.map(answer => ({
                respuesta: answer.respuesta,
                correcto: answer.correcto,
            })),
        };
        return attempt;
    });
};



module.exports = mapAttemptsWithAnswers;