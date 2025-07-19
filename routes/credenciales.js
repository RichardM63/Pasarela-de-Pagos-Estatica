// routes/credenciales.js – upsert con telefono
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { clientes } = require('../data/storage');

const router = express.Router();

/**
 * @swagger
 * /api/agregarCredencialesCliente:
 *   post:
 *     summary: "Alta o actualización de credenciales de comercio"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ComercioPayload' }
 *     responses:
 *       200:
 *         description: Credenciales almacenadas
 */
router.post('/agregarCredencialesCliente', (req, res) => {
  const c = req.body;
  const idx = clientes.findIndex(
    x => x.dominio===c.dominio && x.subdominio===c.subdominio && x.local_id===c.local_id
  );
  if (idx === -1) {
    clientes.push({ ...c, cliente_id: uuidv4() });
  } else {
    clientes[idx] = { ...clientes[idx], ...c };
  }
  res.json({ mensaje:'Credenciales almacenadas' });
});

module.exports = router;
