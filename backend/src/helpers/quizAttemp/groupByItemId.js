const groupByAttemptId = (data) => {
    let idCounter = 1; // Contador que empezará desde 1
    let groupedData = data.reduce((result, current) => {
        // Usamos el idCounter actual si no se ha encontrado el id_intento actual antes
        if (!result[current.id_intento]) {
            result[current.id_intento] = {
                new_id: idCounter++,
                data: [],
            };
        }
        // Agregamos el objeto actual a la lista de su correspondiente id de intento
        result[current.id_intento].data.push(current);
        return result;
    }, {});

    // Ahora debes formar el resultado final, mapeando los nuevos ids a los datos respectivos
    let finalResult = Object.values(groupedData).map(group => ({
        id_intento: group.new_id,
        values: group.data,
    }));

    return finalResult;
}

module.exports = groupByAttemptId;
