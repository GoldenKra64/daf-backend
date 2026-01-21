const validateKardexProdDTO = (data) => {
    const errors = [];

    if (!data.prd_codigo) {
        errors.push('prd_codigo es requerido');
    }

    if (!data.trn_cod) {
        errors.push('trn_cod es requerido');
    }

    if (data.krd_cantidad === undefined || data.krd_cantidad === null) {
        errors.push('krd_cantidad es requerido');
    } else if (typeof data.krd_cantidad !== 'number' || data.krd_cantidad <= 0) {
        errors.push('krd_cantidad debe ser un número positivo');
    }

    if (data.trn_cod === 'ESI' && !data.est_cod) {
        errors.push('Para transacciones tipo ESI es obligatorio el est_cod');
    }

    return errors;
};

module.exports = {
    validateKardexProdDTO,
};