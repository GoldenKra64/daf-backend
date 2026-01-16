<<<<<<< HEAD
const createProveedor = async (pool, data) => {
    const query = `
    INSERT INTO proveedor (
      prv_razonsocial, prv_ruc, prv_telefono, prv_celular, 
      prv_mail, prv_direccion, ct_codigo, prv_estado, prv_fecha_alta
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *;
  `;
    const values = [
        data.prv_razonsocial,
        data.prv_ruc,
        data.prv_telefono,
        data.prv_celular,
        data.prv_mail,
        data.prv_direccion,
        data.ct_codigo,
        data.prv_estado || 'ACT',
        data.prv_fecha_alta || new Date()
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
};

const updateProveedor = async (pool, id, data) => {
    const query = `
    UPDATE proveedor
    SET prv_razonsocial = COALESCE($1, prv_razonsocial),
        prv_ruc = COALESCE($2, prv_ruc),
        prv_telefono = COALESCE($3, prv_telefono),
        prv_celular = COALESCE($4, prv_celular),
        prv_mail = COALESCE($5, prv_mail),
        prv_direccion = COALESCE($6, prv_direccion),
        ct_codigo = COALESCE($7, ct_codigo),
        prv_estado = COALESCE($8, prv_estado)
    WHERE prv_codigo = $9
    RETURNING *;
  `;
    const values = [
        data.prv_razonsocial,
        data.prv_ruc,
        data.prv_telefono,
        data.prv_celular,
        data.prv_mail,
        data.prv_direccion,
        data.ct_codigo,
        data.prv_estado,
        id
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
};

const getAllProveedor = async (pool) => {
    const query = `
    SELECT * FROM proveedor
    ORDER BY prv_razonsocial ASC;
  `;
    const result = await pool.query(query);
    return result.rows;
};

const getProveedorByID = async (pool, id) => {
    const query = 'SELECT * FROM proveedor WHERE prv_codigo = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
};

const deleteProveedor = async (pool, id) => {
    const query = `
    UPDATE proveedor
    SET prv_estado = 'INA'
    WHERE prv_codigo = $1
    RETURNING *;
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
};

module.exports = {
    createProveedor,
    updateProveedor,
    getAllProveedor,
    getProveedorByID,
    deleteProveedor
};
=======
// src/models/proveedor.model.js
const db = require('../config/db');
console.log('DB EXPORT:', db);

const getConnectionWithCredentials = require('../config/db');


const ProveedorModel = {

    // ===============================
    // LISTAR proveedores activos
    // ===============================
    async findAll(dbUser, dbPassword) {
        const pool = getConnectionWithCredentials(dbUser, dbPassword);

        try {
            const query = `
        SELECT *
        FROM proveedor
        WHERE prv_estado = 'ACT'
        ORDER BY prv_razonsocial
      `;
            const { rows } = await pool.query(query);
            return rows;
        } finally {
            await pool.end();
        }
    },

    // ===============================
    // BUSCAR proveedor por código
    // ===============================
    async findById(prv_codigo, dbUser, dbPassword) {
        const pool = getConnectionWithCredentials(dbUser, dbPassword);

        try {
            const { rows } = await pool.query(
                `SELECT * FROM proveedor WHERE prv_codigo = $1`,
                [prv_codigo]
            );
            return rows[0];
        } finally {
            await pool.end();
        }
    },

    // ===============================
    // VALIDAR RUC existente activo
    // ===============================
    async existsByRuc(prv_ruc, dbUser, dbPassword) {
        const pool = getConnectionWithCredentials(dbUser, dbPassword);

        try {
            const result = await pool.query(
                `SELECT 1 FROM proveedor WHERE prv_ruc = $1 AND prv_estado = 'ACT' LIMIT 1`,
                [prv_ruc]
            );
            return result.rowCount > 0;
        } finally {
            await pool.end();
        }
    },

    // ===============================
    // CREAR proveedor
    // ===============================
    async create(data, dbUser, dbPassword) {
        const pool = getConnectionWithCredentials(dbUser, dbPassword);

        try {
            // 🔹 Generar código automático PRV###
            const { rows: cod } = await pool.query(`
        SELECT 'PRV' || LPAD(
            (COALESCE(MAX(SUBSTRING(prv_codigo, 4)::INT), 0) + 1)::TEXT,
            3,
            '0'
            ) AS nuevo_codigo
        FROM proveedor

      `);

            const prv_codigo = cod[0].nuevo_codigo;

            const query = `
        INSERT INTO proveedor (
          prv_codigo,
          ct_codigo,
          prv_razonsocial,
          prv_ruc,
          prv_telefono,
          prv_mail,
          prv_celular,
          prv_direccion,
          prv_fecha_alta,
          prv_estado
        )
        VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8,
          CURRENT_DATE,
          'ACT'
        )
        RETURNING *
      `;

            const values = [
                prv_codigo,
                data.ct_codigo,
                data.prv_razonsocial,
                data.prv_ruc,
                data.prv_telefono,
                data.prv_mail,
                data.prv_celular,
                data.prv_direccion
            ];

            const { rows } = await pool.query(query, values);
            return rows[0];

        } finally {
            await pool.end();
        }
    },

    // ===============================
    // ACTUALIZAR proveedor
    // ===============================
    async update(prv_codigo, data, dbUser, dbPassword) {
        const pool = getConnectionWithCredentials(dbUser, dbPassword);

        try {
            const query = `
            UPDATE proveedor
            SET
                ct_codigo = $1,
                prv_razonsocial = $2,
                prv_ruc = $3,
                prv_telefono = $4,
                prv_mail = $5,
                prv_celular = $6,
                prv_direccion = $7
            WHERE prv_codigo = $8
            RETURNING *
            `;


            const values = [
                data.ct_codigo,
                data.prv_razonsocial,
                data.prv_ruc,
                data.prv_telefono,
                data.prv_mail,
                data.prv_celular,
                data.prv_direccion,
                prv_codigo
            ];


            const { rows } = await pool.query(query, values);
            return rows[0];
        } finally {
            await pool.end();
        }
    },

    // ===============================
    // ELIMINACIÓN LÓGICA
    // ===============================
    async softDelete(prv_codigo, dbUser, dbPassword) {
        const pool = getConnectionWithCredentials(dbUser, dbPassword);

        try {
            await pool.query(
                `UPDATE proveedor SET prv_estado = 'INA' WHERE prv_codigo = $1`,
                [prv_codigo]
            );
        } finally {
            await pool.end();
        }
    }
};

module.exports = ProveedorModel;
>>>>>>> f14ea63 (Interfaz de Proveedor)
