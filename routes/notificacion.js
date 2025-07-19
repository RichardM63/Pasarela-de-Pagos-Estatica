// routes/notificacion.js – Webhook Izipay (numPedido incluido)
const express = require('express');
const { transacciones } = require('../data/storage');

const router = express.Router();

/**
 * @swagger
 * /api/webhookIzipay/notificacion:
 *   post:
 *     summary: "Webhook de Izipay: registra pago y actualiza estado"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/NotificacionQRBody' }
 *     responses:
 *       200:
 *         description: Procesada
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/NotificacionResponse' }
 */
router.post('/notificacion', (req, res) => {
  const { identificarQR, estado, numPedido } = req.body;

  const trx = transacciones.find(t => t.identificarQR === identificarQR);

  if (!trx) {
    return res.status(200).json({ estado:'9999', mensaje:'Transacción inexistente' });
  }

  trx.estado = estado.toLowerCase() === 'aprobado' ? 'pagado' : 'rechazado';
  trx.numPedido = numPedido;
  trx.notificacion = { ...req.body, recibida: new Date() };

  res.json({ estado:'0000', mensaje:'Notificación registrada' });
});

module.exports = router;
