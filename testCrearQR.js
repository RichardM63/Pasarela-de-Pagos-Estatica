// File: testCrearQR.js
const axios = require('axios');
const crypto = require('crypto');
const moment = require('moment');

// Configura tus credenciales
const API_URL = 'https://testizivirtual.izipay.pe:9443/WebAppOperaciones/api/appmovil/generarQR';

const tokenJWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..MoZAmH_af7-AmRC3FPjBmlw1rPUf2cROps86uZIR1tUeyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJtZXJjaGFudENvZGUiOiI0MDA0MzUzIiwiZmFjaWxpdGF0b3JDb2RlIjoiMCIsInRyYW5zYWN0aW9uSWQiOiJjMDQ2MWFkNTA0ZGM0NDgiLCJPcmRlck51bWJlciI6IlIyMDI1MDcxODEyMzQiLCJBbW91bnQiOiIxNS4wMCIsIlRva2VuSWQiOiIwZWZkN2JkZC0yYTY5LTRjYTgtYTFlNS0wYjcyZGMxZTQyZjIiLCJuYmYiOjE3NTI4NTM3MTMsImV4cCI6MTc1Mjg1NDYxMywiaWF0IjoxNzUyODUzNzEzfQ.YwmtsUdC7kt9X62P7_Hz7ZDN8_CtK9WkEZH6KdXf444';
const apiKey = 'VErethUtraQuxas57wuMuquprADrAHAb'; // Clave API
const claveHASH = 'Xom5Hlt9eSWoylYuBrenlbOsTjJedefR'; // Clave HASH

// Parámetros del cuerpo (body)
const body = {
  codComercio: '4004353',
  tipo_qr: 12,
  monto: 1.00,
  moneda: 604,
  numCelular: '',
  imei: '',
  tipoDeTerminal: 'IZIPAYVIR',
  flag_App: 3,
  fechaExp: '2025-07-20T23:59:00-05:00'
};

// Campos necesarios para calcular firma
const idunico = 'IZIPAY_NEW';
const fechahora = moment().format('YYYYMMDDHHmmssSSS'); // Ej: 20250718123045678

// 1️⃣ Concatenar campos para generar firma
const cadenaFirma = `${body.codComercio}|${body.tipo_qr}|${body.monto.toFixed(2)}|${body.moneda}|${idunico}|${fechahora}`;
const firma = crypto.createHash('sha512').update(cadenaFirma + claveHASH).digest('hex');

// 2️⃣ Preparar headers
const headers = {
  'Content-Type': 'application/json',
  Authorization: tokenJWT,
  apikey: apiKey,
  firma: firma,
  idunico: idunico,
  fechahora: fechahora
};

// 3️⃣ Hacer la petición
axios.post(API_URL, body, { headers })
  .then(response => {
    console.log('✅ QR generado correctamente:');
    console.log(response.data);
  })
  .catch(error => {
    console.error('❌ Error al crear QR:', error.response?.data || error.message);
  });
