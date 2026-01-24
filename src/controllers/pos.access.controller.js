const getAccessByRole = (role) => {
  const accessTemplate = {
    PRODUCTO: false,
    MATERIA_PRIMA: false,
    CLIENTE: false,
    PROVEEDOR: false,
    ESTANDAR: false,
    FACTURA: false,
    ORDENCOMPRA: false,
    BODEGA: false,
  };

  switch (role) {
    case 'bodega':
    case 'adm_bodega':
      return {
        ...accessTemplate,
        PRODUCTO: true,
        MATERIA_PRIMA: true,
        ESTANDAR: true,
        BODEGA: true,
      };

    case 'ventas':
    case 'adm_ventas':
    case 'adm_fact':
      return {
        ...accessTemplate,
        PRODUCTO: true,
        CLIENTE: true,
        FACTURA: true,
      };

    case 'compras':
    case 'adm_compras':
      return {
        ...accessTemplate,
        MATERIA_PRIMA: true,
        PROVEEDOR: true,
        ORDENCOMPRA: true,
      };

    case 'admin':
      Object.keys(accessTemplate).forEach(
        key => accessTemplate[key] = true
      );
      return accessTemplate;

    case 'postgres':
      Object.keys(accessTemplate).forEach(
        key => accessTemplate[key] = true
      );
      return accessTemplate;

    default:
      return accessTemplate;
  }
};

const getAccess = (req, res) => {
  const { role } = req.user;

  const access = getAccessByRole(role);

  return res.status(200).json({
    role: role,
    access: access,
  });
};

module.exports = {
  getAccess,
};