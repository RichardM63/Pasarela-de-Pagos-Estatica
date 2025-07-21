// routes/pago.js – Generar pago (QR) y consultar estado
const express = require('express');
const moment  = require('moment');
const { credenciales, transacciones } = require('../data/storage');

const router = express.Router();

/* ---------- 1. Generar pago ------------------------------------------- */
/**
 * @swagger
 * /api/pago/generar:
 *   post:
 *     summary: "Genera un pago (mock)"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GenerarPagoRequest'
 *     responses:
 *       201:
 *         description: Pago generado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GenerarPagoResponse'
 */
router.post('/generar', (req, res) => {
  const {
    dominio, subdominio, localId,
    monto, tipoMoneda, tipoProveedor,
    canalDePago
  } = req.body;

  // valida credenciales activas
  const cred = credenciales.find(c =>
    c.dominio === dominio &&
    c.subdominio === subdominio &&
    c.local_id === localId &&
    c.activo
  );
  if (!cred) {
    return res.status(400).json({
      status: false,
      code: 'BAD_REQUEST',
      message: 'Credenciales no encontradas o inactivas'
    });
  }

  const ts            = moment().format('YYMMDDHHmmssSS');
  const identificador = `${cred.codComercio}${ts}`;
  const qrUrl =
    'https://testizivirtual.izipay.pe:9443/WebAppOperaciones/api/appmovil/generarQR?data=IZIPAY-100-S/';
  const now = new Date();

  transacciones.push({
    identificador,
    dominio,
    subdominio,
    localId,
    monto,
    tipoMoneda,
    tipoProveedor,
    canalDePago,
    estado: 'Pendiente',
    qrUrl,
    createdAt: now,
    updatedAt: now
  });

  res.status(201).json({
    status: true,
    code: 'CREATED',
    message: 'Pago generado correctamente',
    data: {
      identificador,
      monto,
      tipoMoneda,
      qrUrl,
      estado: 'Pendiente',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      __v: 0
    }
  });
});

/* ---------- 2. Consultar estado -------------------------------------- */
/**
 * @swagger
 * /api/pago/consultar:
 *   get:
 *     summary: Consulta el estado del pago
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
 *         name: localId
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: identificador
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: canalDePago
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: tipoProveedor
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Estado del pago (pagado o pendiente)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ConsultarPagoResponse'
 *             examples:
 *               Pendiente:
 *                 summary: Pago Pendiente
 *                 value:
 *                   status: true
 *                   code: OK
 *                   message: Pago No realizado
 *                   data:
 *                     estado: Pendiente
 *               Pagado:
 *                 summary: Pago Exitoso
 *                 value:
 *                   status: true
 *                   code: OK
 *                   message: Pago Exitoso
 *                   data:
 *                     estado: Pagado
 */
router.get('/consultar', (req, res) => {
  const {
    dominio, subdominio, localId,
    identificador, canalDePago, tipoProveedor
  } = req.query;

  const trx = transacciones.find(t =>
    t.identificador === identificador &&
    t.dominio === dominio &&
    t.subdominio === subdominio &&
    t.localId === localId &&
    t.canalDePago === canalDePago &&
    t.tipoProveedor === tipoProveedor
  );

  if (!trx) {
    return res.status(404).json({
      status: false,
      code: 'NOT_FOUND',
      message: 'Transacción no encontrada'
    });
  }

  const pagado = trx.estado.toLowerCase() === 'pagado';
  res.json({
    status: true,
    code: 'OK',
    message: pagado ? 'Pago Exitoso' : 'Pago No realizado',
    data: { estado: trx.estado }
  });
});

module.exports = router;
