<<<<<<< HEAD
const Joi = require('joi');

const createProveedorSchema = Joi.object({
    prv_razonsocial: Joi.string().required().min(3).max(255),
    prv_ruc: Joi.string().required().length(13).pattern(/^\d+$/),
    prv_telefono: Joi.string().pattern(/^\d+$/).allow('', null),
    prv_celular: Joi.string().pattern(/^\d+$/).allow('', null),
    prv_mail: Joi.string().email().allow('', null),
    prv_direccion: Joi.string().allow('', null),
    ct_codigo: Joi.number().integer().required(),
    prv_estado: Joi.string().valid('ACT', 'INA').default('ACT'),
    prv_fecha_alta: Joi.date().default(Date.now)
});

const updateProveedorSchema = Joi.object({
    prv_razonsocial: Joi.string().min(3).max(255),
    prv_ruc: Joi.string().length(13).pattern(/^\d+$/),
    prv_telefono: Joi.string().pattern(/^\d+$/).allow('', null),
    prv_celular: Joi.string().pattern(/^\d+$/).allow('', null),
    prv_mail: Joi.string().email().allow('', null),
    prv_direccion: Joi.string().allow('', null),
    ct_codigo: Joi.number().integer(),
    prv_estado: Joi.string().valid('ACT', 'INA')
});

const validateProveedorDTO = (data, isUpdate = false) => {
    const schema = isUpdate ? updateProveedorSchema : createProveedorSchema;
    const { error } = schema.validate(data, { abortEarly: false });
    return error ? error.details.map((err) => err.message) : [];
};

module.exports = {
    validateProveedorDTO,
=======
// src/dtos/proveedor.dto.js
function validateProveedorDTO(data) {
    const errors = [];

    if (!data.ct_codigo) {
        errors.push('La ciudad es obligatoria');
    }

    if (!data.prv_razonsocial || data.prv_razonsocial.trim() === '') {
        errors.push('La razón social es obligatoria');
    }

    if (!data.prv_ruc || !/^\d{13}$/.test(data.prv_ruc)) {
        errors.push('El RUC debe tener exactamente 13 dígitos');
    }

    if (!data.prv_telefono || !/^\d{7,10}$/.test(data.prv_telefono)) {
        errors.push('El teléfono no es válido');
    }

    if (!data.prv_mail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.prv_mail)) {
        errors.push('El correo electrónico no es válido');
    }

    if (!data.prv_direccion || data.prv_direccion.trim() === '') {
        errors.push('La dirección es obligatoria');
    }

    return errors;
}

module.exports = {
    validateProveedorDTO
>>>>>>> f14ea63 (Interfaz de Proveedor)
};
