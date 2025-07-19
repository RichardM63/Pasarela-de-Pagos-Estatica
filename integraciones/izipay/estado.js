// File: integraciones/izipay/estado.js

// Consulta el estado de una transacción QR por identificarQR y datos del comercio
async function consultarEstado({ db, datos }) {
  const { dominio, subdominio, local_id, integracion, identificarQR } = datos;

  // Busca la transacción exacta por identificarQR y comercio
  const trx = await db.collection('transacciones_qr').findOne({
    dominio,
    subdominio,
    local_id,
    integracion,
    identificarQR
  });

  if (!trx) throw new Error('Transacción no encontrada');

  // Devuelve el estado actual y la última fecha de actualización
  return {
    estado: trx.estado,
    fecha_actualizacion: trx.fecha_actualizacion
  };
}

module.exports = { consultarEstado };
