const { getConnection } = require('../config/db_ecom');

/**
 * Obtener productos públicos con filtros
 * @param {Object} pool - Pool de conexión (opcional, si no se pasa usa el default)
 * @param {Object} filters - Filtros: { q, minPrice, maxPrice, cat, limit, offset }
 */
const getPublicProducts = async (filters) => {
  const pool = getConnection();
  const params = [];
  let whereClauses = [];

  // Filtro por término de búsqueda (nombre o descripción)
  if (filters.q) {
    params.push(`%${filters.q}%`);
    whereClauses.push(`(nombre ILIKE $${params.length} OR descripcion_corta ILIKE $${params.length})`);
  }

  // Filtro por categoría
  if (filters.cat) {
    params.push(filters.cat);
    whereClauses.push(`cat_codigo = $${params.length}`);
  }

  // Filtro por rango de precio
  if (filters.minPrice) {
    params.push(filters.minPrice);
    whereClauses.push(`precio >= $${params.length}`);
  }

  if (filters.maxPrice) {
    params.push(filters.maxPrice);
    whereClauses.push(`precio <= $${params.length}`);
  }

  const whereSQL = whereClauses.length > 0 ? 'WHERE ' + whereClauses.join(' AND ') : '';

  // Paginación
  const limit = filters.limit || 20;
  const offset = filters.offset || 0;
  
  // Agregar paginación a params
  params.push(limit);
  const limitParamIdx = params.length;
  params.push(offset);
  const offsetParamIdx = params.length;

  const query = `
    SELECT 
      id, 
      cat_codigo, 
      categoria, 
      um_descripcion, 
      nombre, 
      descripcion_corta, 
      precio, 
      imagen, 
      stock, 
      prioridad,
      count(*) OVER() as total_count
    FROM vw_productos_ecom
    ${whereSQL}
    ORDER BY prioridad ASC, nombre ASC
    LIMIT $${limitParamIdx} OFFSET $${offsetParamIdx}
  `;

  const result = await pool.query(query, params);
  return result.rows;
};

/**
 * Obtener detalle de un producto por ID
 * @param {string} id - ID del producto
 */
const getPublicProductByID = async (id) => {
  const pool = getConnection();
  const query = `
    SELECT *
    FROM vw_productos_ecom
    WHERE id = $1
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

module.exports = {
  getPublicProducts,
  getPublicProductByID
};
