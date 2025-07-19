// routes/notificacion.js – Webhook Izipay
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
  const {
    identificarQR,
    codigo_estado,   // ← se usa para determinar pagado / rechazado
    numPedido
  } = req.body;

  const trx = transacciones.find(t => t.identificarQR === identificarQR);

  if (!trx) {
    // No encontrada: se responde 9999 pero no se lanza error
    return res.status(200).json({ estado: '9999', mensaje: 'Transacción inexistente' });
  }

  // "00" = aprobada  -> pagado; cualquier otro código -> rechazado
  trx.estado = codigo_estado === '00' ? 'pagado' : 'rechazado';
  trx.numPedido = numPedido;
  trx.notificacion = { ...req.body, recibida: new Date() };

  res.json({ estado: '0000', mensaje: 'Notificación registrada' });
});

module.exports = router;
