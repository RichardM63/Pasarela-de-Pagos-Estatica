// routes/qr.js  – Swagger anotaciones válidas
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');
const { clientes, transacciones } = require('../data/storage');

const router = express.Router();

/* ───────── 1. Registro ───────── */
/**
 * @swagger
 * /api/qr/registrar:
 *   post:
 *     summary: Registra un nuevo comercio
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ComercioPayload'
 *     responses:
 *       200:
 *         description: Comercio registrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: Registro exitoso
 */
router.post('/registrar', (req, res) => {
  const c = req.body;
  const ya = clientes.find(
    x => x.dominio === c.dominio && x.subdominio === c.subdominio && x.local_id === c.local_id
  );
  if (ya) return res.status(409).json({ error: 'Comercio ya existe' });
  clientes.push({ ...c, cliente_id: uuidv4() });
  res.json({ mensaje: 'Registro exitoso' });
});

/* ───────── 2. Actualización ───────── */
/**
 * @swagger
 * /api/qr/actualizar:
 *   put:
 *     summary: Actualiza credenciales de un comercio
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ComercioPayload'
 *     responses:
 *       200:
 *         description: Comercio actualizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: Actualización exitosa
 */
router.put('/actualizar', (req, res) => {
  const c = req.body;
  const idx = clientes.findIndex(
    x => x.dominio === c.dominio && x.subdominio === c.subdominio && x.local_id === c.local_id
  );
  if (idx === -1) return res.status(404).json({ error: 'Comercio no encontrado' });
  clientes[idx] = { ...clientes[idx], ...c };
  res.json({ mensaje: 'Actualización exitosa' });
});

/* ───────── 3. Generar QR ───────── */
/**
 * @swagger
 * /api/qr/generar:
 *   post:
 *     summary: Genera un QR (mock)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GenerarRequest'
 *     responses:
 *       200:
 *         description: QR generado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GenerarResponse'
 */
router.post('/generar', (req, res) => {
  const { dominio, subdominio, local_id, monto } = req.body;
  const cred = clientes.find(
    x => x.dominio === dominio && x.subdominio === subdominio && x.local_id === local_id
  );
  if (!cred) return res.status(400).json({ error: 'Comercio no registrado' });

  const timestamp     = moment().format('YYMMDDHHmmssSS');
  const identificarQR = `${cred.codComercio}${timestamp}`;
  const datosHex      = '89504E470D0A1A0A...'; // truncado

  transacciones.push({ identificarQR, dominio, subdominio, local_id, estado: 'pendiente', datosHex, monto });
  res.json({ datos: datosHex, identificarQR, estado: 'pendiente' });
});

/* ───────── 4. Consultar estado ───────── */
/**
 * @swagger
 * /api/qr/estado:
 *   get:
 *     summary: Consulta el estado de un QR (mock -> pagado)
 *     parameters:
 *       - in: query
 *         name: dominio
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: subdominio
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: local_id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: identificadorQR
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Estado de la transacción
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EstadoResponse'
 */
router.get('/estado', (req, res) => {
  const { dominio, subdominio, local_id, identificadorQR } = req.query;
  const trx = transacciones.find(
    t =>
      t.identificarQR === identificadorQR &&
      t.dominio === dominio &&
      t.subdominio === subdominio &&
      t.local_id === local_id
  );
  if (!trx) return res.status(404).json({ error: 'Transacción no encontrada' });

  trx.estado = 'pagado'; // simulación
  res.json({ mensaje: 'Transacción pagada', estado: trx.estado });
});

module.exports = router;
