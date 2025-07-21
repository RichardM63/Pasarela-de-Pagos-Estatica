// routes/credenciales.js – Registro / actualización de credenciales
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { credenciales } = require('../data/storage');

const router = express.Router();

/**
 * @swagger
 * /api/credencialesCliente:
 *   post:
 *     summary: Registra o actualiza credenciales (si ?id se envía, se actualiza)
 *     parameters:
 *       - in: query
 *         name: id
 *         description: ID de credencial existente a actualizar
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CredencialesRequest'
 *           example:
 *             dominio: demo.com
 *             subdominio: default
 *             local_id: "12"
 *             tipoProveedor: IziPay
 *             codComercio: "8756944"
 *             apikey: D45B7C88-D7E2-4E9E-B170-3B66F4225BDD
 *             idunico: IZIAPY_NEW
 *             hashSecret: A1B2...
 *             telefono: "978548445"
 *             activo: true
 *     responses:
 *       201:
 *         description: Credencial creada/actualizada
 *         content:
 *           application/json:
 *             example:
 *               status: true
 *               code: CREATED
 *               message: Credenciales IziPay Registradas Correctamente
 *               data:
 *                 activo: true
 */
router.post('/credencialesCliente', (req, res) => {
  const id   = req.query.id || null;
  const body = req.body;

  let mensaje;
  if (id) {
    const idx = credenciales.findIndex(c => c.id === id);
    if (idx === -1) {
      return res.status(404).json({
        status: false,
        code: 'NOT_FOUND',
        message: 'ID no existe'
      });
    }
    credenciales[idx] = { ...credenciales[idx], ...body };
    mensaje = 'Credenciales IziPay Actualizadas Correctamente';
  } else {
    credenciales.push({ ...body, id: uuidv4() });
    mensaje = 'Credenciales IziPay Registradas Correctamente';
  }

  res.status(201).json({
    status: true,
    code: 'CREATED',
    message: mensaje,
    data: { activo: body.activo }
  });
});

module.exports = router;

