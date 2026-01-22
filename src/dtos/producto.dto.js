const dotenv = require('dotenv');
dotenv.config();

const validateProductoDTO = (data, isUpdate = false) => {
  const errors = [];

  const allowedPrioridad = ['L', 'F'];

  if (!isUpdate || data.um_venta !== undefined) {
    if (!data.um_venta || data.um_venta.length > 10) {
      errors.push('um_venta es requerida y máximo 10 caracteres');
    }
  }

  if (!isUpdate || data.cat_codigo !== undefined) {
    // puede ser null
    if (data.cat_codigo !== null && data.cat_codigo !== undefined) {
      if (typeof data.cat_codigo !== 'string' || data.cat_codigo.length > 10) {
        errors.push('cat_codigo máximo 10 caracteres (o null)');
      }
    }
  }

  if (!isUpdate || data.prd_nombre !== undefined) {
    if (!data.prd_nombre || data.prd_nombre.length > 60) {
      errors.push('prd_nombre es requerido y máximo 60 caracteres');
    }
  }

  if (!isUpdate || data.prd_desc_corta !== undefined) {
    if (!data.prd_desc_corta || data.prd_desc_corta.length > 60) {
      errors.push('prd_desc_corta es requerida y máximo 60 caracteres');
    }
  }

  if (!isUpdate || data.prd_desc_larga !== undefined) {
    if (!data.prd_desc_larga || data.prd_desc_larga.length > 255) {
      errors.push('prd_desc_larga es requerida y máximo 255 caracteres');
    }
  }

  if (!isUpdate || data.prd_precio_venta !== undefined) {
    if (typeof data.prd_precio_venta !== 'number' || data.prd_precio_venta < 0) {
      errors.push('prd_precio_venta debe ser numérico y mayor a 0');
    }
  }

  if (!isUpdate || data.prd_stock !== undefined) {
    if (!Number.isInteger(data.prd_stock) || data.prd_stock < 0) {
      errors.push('prd_stock debe ser entero y mayor a 0');
    }
  }

  if (!isUpdate || data.prd_prioridad !== undefined) {
    if (!allowedPrioridad.includes(data.prd_prioridad)) {
      errors.push('prd_prioridad solo puede ser L o F');
    }
  }

  if (!isUpdate || data.prd_img !== undefined) {
    if (data.prd_img !== null && data.prd_img !== undefined) {
      if (typeof data.prd_img !== 'string' || data.prd_img.length > 255) {
        errors.push('prd_img máximo 255 caracteres (o null)');
      }
    }
  }

  // prd_promocion / prd_estado NO deben venir en CREATE (tu SP los fija),
  // pero en UPDATE los permitimos si quieres.
  if (isUpdate && data.prd_promocion !== undefined) {
    if (!Number.isInteger(data.prd_promocion) || data.prd_promocion < 0 || data.prd_promocion > 100) {
      errors.push('prd_promocion debe ser entero entre 0 y 100');
    }
  }

  if (isUpdate && data.prd_estado !== undefined) {
    const allowedEstado = ['ACT', 'INA', 'SUS'];
    if (data.prd_estado !== null && !allowedEstado.includes(data.prd_estado)) {
      errors.push('prd_estado solo puede ser ACT, INA o SUS (o null)');
    }
  }

  return errors;
};

module.exports = {
  validateProductoDTO,
};
