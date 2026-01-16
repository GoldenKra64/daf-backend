// src/dtos/cliente.dto.js

const validateClienteDTO = (data, isUpdate = false) => {
  const errors = [];
  const validStatuses = ['ACT', 'INA', 'SUS'];

  // Validación de Ciudad (FK)
  if (!isUpdate || data.ct_codigo !== undefined) {
    if (!data.ct_codigo || data.ct_codigo.length > 10) {
      errors.push('ct_codigo es requerido y máximo 10 caracteres');
    }
  }

  // Validación de Usuario (FK)
  if (!isUpdate || data.usr_email !== undefined) {
    if (!data.usr_email || data.usr_email.length > 60) {
      errors.push('usr_email es requerido y máximo 60 caracteres');
    }
  }

  // Nombre
  if (!isUpdate || data.cli_nombre !== undefined) {
    if (!data.cli_nombre || data.cli_nombre.length > 120) {
      errors.push('cli_nombre es requerido y máximo 120 caracteres');
    }
  }

  // RUC / Cédula (13 dígitos)
  if (!isUpdate || data.cli_ruc_ced !== undefined) {
    if (!data.cli_ruc_ced || !/^\d{13}$/.test(data.cli_ruc_ced)) {
      errors.push('cli_ruc_ced es requerido y debe tener 13 dígitos numéricos');
    }
  }

  // Teléfono (10 dígitos)
  if (!isUpdate || data.cli_telefono !== undefined) {
    if (!data.cli_telefono || !/^\d{10}$/.test(data.cli_telefono)) {
      errors.push('cli_telefono es requerido y debe tener 10 dígitos numéricos');
    }
  }

  // Email
  if (!isUpdate || data.cli_mail !== undefined) {
    if (!data.cli_mail || data.cli_mail.length > 60) {
      errors.push('cli_mail es requerido y máximo 60 caracteres');
    }
  }

  return errors;
};

// Exportación final OBLIGATORIA
module.exports = {
  validateClienteDTO
};