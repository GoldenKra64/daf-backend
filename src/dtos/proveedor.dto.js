const Joi = require('joi');

const createProveedorSchema = Joi.object({
    prv_razonsocial: Joi.string()
        .min(7)
        .max(120)
        .required()
        .messages({
            'string.empty': 'La razón social es obligatoria',
            'string.min': 'La razón social debe tener al menos 7 caracteres'
        }),

    prv_ruc: Joi.string()
        .length(13)
        .pattern(/^\d+$/)
        .required()
        .messages({
            'string.empty': 'El RUC es obligatorio',
            'string.length': 'El RUC debe tener exactamente 13 dígitos',
            'string.pattern.base': 'El RUC solo debe contener números'
        }),

    prv_telefono: Joi.string()
        .max(10)
        .pattern(/^\d+$/)
        .required()
        .messages({
            'string.empty': 'El teléfono es obligatorio',
            'string.max': 'El teléfono no puede exceder los 10 dígitos',
            'string.pattern.base': 'El teléfono solo debe contener números'
        }),

    prv_celular: Joi.string()
        .max(9)
        .pattern(/^\d+$/)
        .required()
        .messages({
            'string.empty': 'El celular es obligatorio',
            'string.max': 'El celular no puede exceder los 9 dígitos',
            'string.pattern.base': 'El celular solo debe contener números'
        }),

    prv_mail: Joi.string()
        .email()
        .max(60)
        .required()
        .messages({
            'string.empty': 'El correo es obligatorio',
            'string.email': 'Formato de correo electrónico no válido',
            'string.max': 'El correo no puede exceder los 60 caracteres'
        }),

    prv_direccion: Joi.string()
        .min(5)
        .max(60)
        .required()
        .messages({
            'string.empty': 'La dirección es obligatoria',
            'string.min': 'La dirección debe tener al menos 5 caracteres',
            'string.max': 'La dirección no puede exceder los 60 caracteres'
        }),

    ct_codigo: Joi.string()
        .required()
        .messages({
            'string.empty': 'Debe seleccionar una ciudad'
        }),

    prv_estado: Joi.string()
        .valid('ACT', 'INA')
        .required(),

    prv_fecha_alta: Joi.date()
        .required()
});


const updateProveedorSchema = Joi.object({
    prv_razonsocial: Joi.string()
        .min(7)
        .max(255)
        .messages({
            'string.min': 'La razón social debe tener al menos  caracteres'
        }),

    prv_ruc: Joi.string()
        .length(13)
        .pattern(/^\d+$/)
        .messages({
            'string.length': 'El RUC debe tener 13 dígitos',
            'string.pattern.base': 'El RUC solo debe contener números'
        }),

    prv_telefono: Joi.string()
        .max(10)
        .pattern(/^\d+$/)
        .messages({
            'string.max': 'El teléfono debe tener máximo 10 dígitos',
            'string.pattern.base': 'El teléfono solo debe contener números'
        }),

    prv_celular: Joi.string()
        .max(9)
        .pattern(/^\d+$/)
        .messages({
            'string.max': 'El celular debe tener máximo 9 dígitos',
            'string.pattern.base': 'El celular solo debe contener números'
        }),

    prv_mail: Joi.string()
        .email()
        .max(60)
        .messages({
            'string.email': 'Formato de correo electrónico no válido',
            'string.max': 'El correo no puede exceder los 60 caracteres'
        }),

    prv_direccion: Joi.string()
        .min(5)
        .max(60)
        .messages({
            'string.min': 'La dirección debe tener al menos 5 caracteres',
            'string.max': 'La dirección no puede exceder los 60 caracteres'
        }),

    ct_codigo: Joi.string()
        .messages({
            'string.empty': 'Debe seleccionar una ciudad'
        }),

    prv_estado: Joi.string()
        .valid('ACT', 'INA')
});

const validateProveedorDTO = (data, isUpdate = false) => {
    const schema = isUpdate ? updateProveedorSchema : createProveedorSchema;
    const { error } = schema.validate(data, { abortEarly: false, stripUnknown: true });
    return error ? error.details.map((err) => err.message) : [];
};

module.exports = {
    validateProveedorDTO,
};
