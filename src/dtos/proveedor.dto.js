const Joi = require('joi');

const createProveedorSchema = Joi.object({
    prv_razonsocial: Joi.string().required().min(3).max(255),
    prv_ruc: Joi.string().required().length(13).pattern(/^\d+$/),
    prv_telefono: Joi.string().pattern(/^\d+$/).allow('', null),
    prv_celular: Joi.string().pattern(/^\d+$/).allow('', null),
    prv_mail: Joi.string().email().allow('', null),
    prv_direccion: Joi.string().allow('', null),
    ct_codigo: Joi.number().integer().required(),
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
};
