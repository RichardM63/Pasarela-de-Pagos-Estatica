// routes/qr.js – Generar y consultar QR (con telefono)
const express = require('express');
const moment  = require('moment');
const { clientes, transacciones } = require('../data/storage');

const router = express.Router();

/* ---- Generar QR -------------------------------------------------------- */
/**
 * @swagger
 * /api/qr/generar:
 *   post:
 *     summary: "Genera un código QR de pago (mock)"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/GenerarRequest' }
 *     responses:
 *       200:
 *         description: QR generado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/GenerarResponse' }
 */
router.post('/generar', (req, res) => {
  const { dominio, subdominio, local_id, monto, tipoMoneda, telefono } = req.body;

  const cred = clientes.find(
    x => x.dominio===dominio && x.subdominio===subdominio && x.local_id===local_id && x.activo
  );
  if (!cred) return res.status(400).json({ error:'Comercio no registrado o inactivo' });

  const monedaIso = { soles: 604, dolares: 840 }[tipoMoneda.toLowerCase()] ?? 604;
  const ts            = moment().format('YYMMDDHHmmssSS');
  const identificarQR = `${cred.codComercio}${ts}`;
  const datosHex      = '89504E470D0A1A0A...';

  transacciones.push({
    identificarQR, dominio, subdominio, local_id,
    estado:'pendiente', datosHex, monto, monedaIso, telefono
  });

  res.json({ datos: datosHex, identificarQR, estado:'pendiente' });
});

/* ---- Consultar estado -------------------------------------------------- */
/**
 * @swagger
 * /api/qr/estado:
 *   get:
 *     summary: "Devuelve el estado de la transacción (mock: siempre pagado)"
 *     parameters:
 *       - in: query
 *         name: dominio
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: subdominio
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: local_id
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: identificadorQR
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Estado actualizado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/EstadoResponse' }
 */
router.get('/estado', (req, res) => {
  const { dominio, subdominio, local_id, identificadorQR } = req.query;
  const trx = transacciones.find(
    t => t.identificarQR===identificadorQR && t.dominio===dominio &&
         t.subdominio===subdominio && t.local_id===local_id
  );
  if (!trx) return res.status(404).json({ error:'Transacción no encontrada' });

  trx.estado = 'pagado';
  res.json({ mensaje:'Transacción pagada', estado: trx.estado });
});

module.exports = router;
