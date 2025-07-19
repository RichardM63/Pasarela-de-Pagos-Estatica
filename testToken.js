const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

// Credenciales de sandbox Izipay
const publicKey = 'VErethUtraQuxas57wuMuquprADrAHAb';
const merchantCode = '4004353'; // Este es tu código de comercio
const orderNumber = 'R202507181234'; // Un número de pedido único
const transactionId = uuidv4().replace(/-/g, '').slice(0, 15); // Máximo 40 chars
const amount = '15.00'; // Monto decimal string

async function generarToken() {
  try {
    const response = await axios.post(
      'https://sandbox-api-pw.izipay.pe/gateway/api/v1/proxy-cors/https://sandbox-api-pw.izipay.pe/security/v1/Token/Generate',
      {
        requestSource: 'ECOMMERCE',
        merchantCode,
        orderNumber,
        publicKey,
        amount
      },
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'transactionId': transactionId
        }
      }
    );

    console.log('✅ Token generado correctamente:', response.data.response.token);
  } catch (err) {
    console.error('❌ Error al generar token:', err.response?.data || err.message);
  }
}

generarToken();
