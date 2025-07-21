// routes/notificacion.js – Webhook Izipay (mock)
const express = require('express');
const { transacciones } = require('../data/storage');

const router = express.Router();

/**
 * @swagger
 * /api/webhookIzipay/notificacion:
 *   post:
 *     summary: "Webhook Izipay – registra pago y actualiza estado"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NotificacionQRBody'
 *           example:
 *             identificarQR: "875694425072116071065"
 *             estado: Aprobado
 *             codigo_estado: "00"
 *             monto: 0
 *             tipoMoneda: PEN
 *             fechaTxn: "36804592"
 *             horaTxn: "048582"
 *             numPedido: "string"
 *             canalDePago: qr
 *     responses:
 *       201:
 *         description: Notificación procesada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotificacionResponse'
 *             example:
 *               status: true
 *               code: CREATED
 *               message: Notificación registrada correctamente
 *               data:
 *                 idTransaccion: 99999
 */
router.post('/notificacion', (req, res) => {
  const { identificarQR, codigo_estado, canalDePago } = req.body;

  const trx = transacciones.find(
    t => t.identificador === identificarQR && t.canalDePago === canalDePago
  );

  if (!trx) {
    return res.status(201).json({
      status: true,
      code: 'CREATED',
      message: 'Transacción inexistente (registrada para auditoría)',
      data: { idTransaccion: -1 }
    });
  }

  trx.estado    = codigo_estado === '00' ? 'Pagado' : 'Rechazado';
  trx.updatedAt = new Date();

  res.status(201).json({
    status: true,
    code: 'CREATED',
    message: 'Notificación registrada correctamente',
    data: { idTransaccion: 99999 }
  });
});

module.exports = router;
