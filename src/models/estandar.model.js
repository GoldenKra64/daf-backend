const createEstandar = async (pool, data) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const {
      prd_codigo,
      detalles
    } = data;

    const est_cod = await client.query(
      `CALL sp_insertar_estandar($1, null);`,
      [prd_codigo]
    );

    for (const d of detalles) {
      await client.query(
        `INSERT INTO detalle_estandar
         (mp_codigo, est_cod, mxp_cantidad, mpx_estado)
         VALUES ($1,$2,$3,'PEN')`,
        [
          d.mp_codigo,
          est_cod.rows[0].p_est_cod,
          d.mxp_cantidad,
        ]
      );
    }

    await client.query('COMMIT');
    return { message: 'Estandar creado correctamente' };

  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// GET BY ID
const getEstandarById = async (pool, est_cod) => {
  const cabecera = await pool.query(
    `SELECT * FROM estandar WHERE est_cod = $1`,
    [est_cod]
  );

  const detalles = await pool.query(
    `SELECT * FROM detalle_estandar WHERE est_cod = $1`,
    [est_cod]
  );

  return {
    ...cabecera.rows[0],
    detalles: detalles.rows
  };
};

const getAllEstandares = async (pool, page) => {
  const limit = 10;
  const offset = (page - 1) * limit;

  const result = await pool.query(
    `SELECT *
     FROM estandar
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );

  return result.rows;
};

// UPSERT
const upsertDetalles = async (pool, est_cod, detalles) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    for (const d of detalles) {
      const exists = await client.query(
        `SELECT 1
         FROM detalle_estandar
         WHERE est_cod = $1 AND mp_codigo = $2`,
        [est_cod, d.mp_codigo]
      );

      if (exists.rowCount === 0) {
        await client.query(
          `INSERT INTO detalle_estandar
           (mp_codigo, est_cod, mxp_cantidad, mpx_costo_unitario, mpx_subtotal, mpx_estado)
           VALUES ($1,$2,$3,$4,$5,'${process.env.PENDENT_STATUS_DEPENDENT}')`,
          [
            d.mp_codigo,
            est_cod,
            d.mxp_cantidad ?? null,
            d.mpx_costo_unitario ?? null,
            d.mpx_subtotal ?? null
          ]
        );
      } else {
        await client.query(
          `UPDATE detalle_estandar
           SET mxp_cantidad = $1,
               mpx_costo_unitario = $2,
               mpx_subtotal = $3
           WHERE est_cod = $4 AND mp_codigo = $5`,
          [
            d.mxp_cantidad ?? null,
            d.mpx_costo_unitario ?? null,
            d.mpx_subtotal ?? null,
            est_cod,
            d.mp_codigo
          ]
        );
      }
    }

    await client.query('COMMIT');
    return { message: 'Detalles insertados / actualizados correctamente' };

  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const deleteDetalle = async (pool, est_cod, materiasprimas) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    for (const d of materiasprimas) {
      await client.query(
        `DELETE FROM detalle_estandar
        WHERE est_cod = $1 AND mp_codigo = $2`,
        [est_cod, d]
      );
    }
    await client.query('COMMIT');
    return { message: 'Detalles eliminados correctamente' };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const approveHeader = async (pool, est_cod) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    await client.query(
      `UPDATE estandar
       SET est_estado = '${process.env.APPROVED_STATUS_DEPENDENT}'
       WHERE est_cod = $1`,
      [est_cod]
    );
    await client.query('COMMIT');
    return { message: 'Datos aprobados correctamente' };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

const anuHeader = async (pool, est_cod) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    await client.query(
      `UPDATE estandar
       SET est_estado = '${process.env.ANU_STATUS_DEPENDENT}'
       WHERE est_cod = $1`,
      [est_cod]
    );
    await client.query('COMMIT');
    return { message: 'Datos anulados correctamente' };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

const getEstandaresByProductId = async (pool, prd_codigo) => {
  const result = await pool.query(
    `SELECT * FROM estandar WHERE prd_codigo = $1 AND est_estado = '${process.env.APPROVED_STATUS_DEPENDENT}'`,
    [prd_codigo]
  );
  return result.rows;
};

module.exports = {
  createEstandar,
  getEstandarById,
  upsertDetalles,
  getAllEstandares,
  deleteDetalle,
  approveHeader,
  anuHeader,
  getEstandaresByProductId
};