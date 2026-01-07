const dotenv = require('dotenv');
dotenv.config();

const validateMateriaPrimaDTO = (data, isUpdate = false) => {
  const errors = [];

  const allowedPrioridad = ['L', 'F'];

  if (!isUpdate || data.unidad_medida !== undefined) {
    if (!data.unidad_medida || data.unidad_medida.length > 10) {
      errors.push('unidad_medida es requerida y máximo 10 caracteres');
    }
  }

  if (!isUpdate || data.descripcion !== undefined) {
    if (!data.descripcion || data.descripcion.length > 60) {
      errors.push('descripcion es requerida y máximo 60 caracteres');
    }
  }

  if (!isUpdate || data.costo !== undefined) {
    if (typeof data.costo !== 'number') {
      errors.push('costo debe ser numérico');
    }
  }

  if (!isUpdate || data.cantidad !== undefined) {
    if (!Number.isInteger(data.cantidad)) {
      errors.push('cantidad debe ser entero');
    }
  }

  if (!isUpdate || data.prioridad !== undefined) {
    if (!allowedPrioridad.includes(data.prioridad)) {
      errors.push('prioridad solo puede ser L o F');
    }
  }

  return errors;
};

module.exports = {
  validateMateriaPrimaDTO,
};