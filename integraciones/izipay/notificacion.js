// File: integraciones/izipay/notificacion.js

// Procesa la notificación enviada por IZIPAY al completar el pago
async function procesarNotificacion({ db, body }) {
  const filtro = { identificarQR: body.identificarQR, estado: 'pendiente' };

  // Actualiza el estado de la transacción
  const actualizacion = {
    $set: {
      estado: body.estado.toLowerCase() === 'aprobado' ? 'aprobado' : 'rechazado',
      fecha_actualizacion: new Date(),
      notificacion_izipay: body
    }
  };

  const resultado = await db.collection('transacciones_qr').updateOne(filtro, actualizacion);

  // Si no se encontró, guarda en tabla de errores
  if (resultado.matchedCount === 0) {
    await db.collection('webhook_fallas').insertOne({
      intento: new Date(),
      identificarQR: body.identificarQR,
      body,
      motivo: 'No se encontró transacción pendiente'
    });
  }

  return { estado: '0000', mensaje: 'Notificación registrada' };
}

module.exports = { procesarNotificacion };
