// app.js – Express 4 + Swagger UI, 4 endpoints, sin BD
require('dotenv').config();

const express      = require('express');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi    = require('swagger-ui-express');

const qrRoutes = require('./routes/qr');

const PORT = process.env.PORT || 5578;
const app  = express();

app.use(express.json());
app.use('/api/qr', qrRoutes);

/* ───── Swagger spec ───── */
const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title:   'Izipay QR – API estática',
      version: '1.0.0',
      description:
        'Mock que registra comercios, actualiza credenciales, genera QR y consulta estado (siempre “pagado”).'
    },
    components: {
      schemas: {
        /* 1️⃣ Registro / Actualización */
        ComercioPayload: {
          type: 'object',
          required: [
            'dominio','subdominio','local_id',
            'codComercio','apikey','idunico','pbkdf2_secret'
          ],
          properties: {
            dominio:    { type:'string',   description:'Dominio de la tienda',    example:'demo.com' },
            subdominio: { type:'string',   description:'Subdominio o sucursal',   example:'default' },
            local_id:   { type:'string',   description:'Identificador local',     example:'12' },
            codComercio:{ type:'string',   description:'AN(15) – código comercio Izipay', pattern:'^[0-9]{1,15}$', example:'8756944' },
            apikey:     { type:'string',   description:'GUID provisto por Izipay', example:'D45B7C88-D7E2-4E9E-B170-3B66F4225BDD' },
            idunico:    { type:'string',   description:'ID único del producto',    example:'IZIAPY_NEW' },
            pbkdf2_secret:{type:'string',  description:'Secreto PBKDF2 (hex 64+)', example:'A1B2…' }
          }
        },
        /* 2️⃣ Request para generar QR */
        GenerarRequest: {
          type:'object',
          required:['dominio','subdominio','local_id','monto','tipoMoneda','tipoProveedor'],
          properties:{
            dominio:    { type:'string', example:'demo.com' },
            subdominio: { type:'string', example:'default' },
            local_id:   { type:'string', example:'12' },
            monto:      { type:'number', example:1.00, description:'Monto decimal (máx 2 decimales)' },
            tipoMoneda: { type:'integer', example:604, description:'604 = Soles' },
            tipoProveedor:{type:'string', example:'IziPay'}
          }
        },
        /* 3️⃣ Respuesta de generación */
        GenerarResponse:{
          type:'object',
          properties:{
            datos:         { type:'string', description:'PNG en HEX' },
            identificarQR: { type:'string', description:'ID único de la transacción' },
            estado:        { type:'string', example:'pendiente' }
          }
        },
        /* 4️⃣ Respuesta de estado */
        EstadoResponse:{
          type:'object',
          properties:{
            mensaje:{ type:'string', example:'Transacción pagada' },
            estado: { type:'string', example:'pagado' }
          }
        }
      }
    }
  },
  apis:['./routes/*.js']
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.listen(PORT, () => {
  console.log(`✅ http://localhost:${PORT}`);
  console.log(`📄 Swagger: /api-docs`);
});
