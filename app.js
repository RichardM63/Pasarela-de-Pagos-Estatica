// app.js – Express 4 + Swagger UI (v 1.3.1)
require('dotenv').config();
const express      = require('express');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi    = require('swagger-ui-express');

const qrRoutes   = require('./routes/qr');
const credRoutes = require('./routes/credenciales');
const notiRoutes = require('./routes/notificacion');

const PORT = process.env.PORT || 5578;
const app  = express();

app.use(express.json());
app.use('/api/qr',            qrRoutes);
app.use('/api',               credRoutes);
app.use('/api/webhookIzipay', notiRoutes);

/* ───────────────────────── Swagger spec ───────────────────────── */
const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title:   'Pasarela de pagos estática',
      version: '1.3.1',
      description:
        'Mock para registrar/upsert comercios, generar QR, consultar estado y recibir webhook.'
    },
    components: {
      schemas: {
        /* -- Comercio ---------------------------------------------------- */
        ComercioPayload: {
          type: 'object',
          required: [
            'dominio','subdominio','local_id',
            'codComercio','apikey','idunico','pbkdf2_secret',
            'activo','tipoProveedor','telefono'
          ],
          properties: {
            dominio:    { type:'string', example:'demo.com' },
            subdominio: { type:'string', example:'default' },
            local_id:   { type:'string', example:'12' },
            codComercio:{ type:'string', pattern:'^[0-9]{1,15}$', example:'8756944' },
            apikey:     { type:'string', example:'D45B7C88-D7E2-4E9E-B170-3B66F4225BDD' },
            idunico:    { type:'string', example:'IZIAPY_NEW' },
            pbkdf2_secret:{type:'string', minLength:64, example:'A1B2...' },
            activo:     { type:'boolean', example:true },
            tipoProveedor:{type:'string', example:'IziPay'},
            telefono:   { type:'string', maxLength:15, example:'978548445' }
          }
        },
        /* -- Generar QR --------------------------------------------------- */
        GenerarRequest: {
          type:'object',
          required:[
            'dominio','subdominio','local_id',
            'monto','tipoMoneda','tipoProveedor'
          ],
          properties:{
            dominio:       { type:'string', example:'demo.com' },
            subdominio:    { type:'string', example:'default' },
            local_id:      { type:'string', example:'12' },
            monto:         { type:'number', example:1.00 },
            tipoMoneda:    { type:'string', enum:['soles','dolares'] },
            tipoProveedor: { type:'string', example:'IziPay' }
          }
        },
        GenerarResponse:{
          type:'object',
          properties:{
            datos:{type:'string'}, identificarQR:{type:'string'}, estado:{type:'string'}
          }
        },
        /* -- Estado ------------------------------------------------------- */
        EstadoResponse:{
          type:'object',
          properties:{
            mensaje:{type:'string'}, estado:{type:'string'}
          }
        },
        /* -- Webhook ------------------------------------------------------ */
        NotificacionQRBody:{
          type:'object',
          required:[
            'identificarQR','estado','codigo_estado',
            'monto','moneda','fechaTxn','horaTxn','numPedido'
          ],
          properties:{
            identificarQR:{type:'string',maxLength:30},
            estado:{type:'string',enum:['Aprobado','Rechazado']},
            codigo_estado: {
      type: 'string',
      pattern: '^[0-9A-Z]{2}$',
      example: '00'           // ← aquí el cambio
    },
            monto:{type:'number'},
            moneda:{type:'integer',enum:[604,840]},
            fechaTxn:{type:'string',pattern:'^[0-9]{8}$'},
            horaTxn:{type:'string',pattern:'^[0-9]{6}$'},
            numPedido:{type:'string',maxLength:20}
          }
        },
        NotificacionResponse:{
          type:'object',
          properties:{
            estado:{type:'string',example:'0000'},
            mensaje:{type:'string',example:'Notificación registrada'}
          }
        }
      }
    }
  },
  apis:['./routes/*.js']
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
/* ----------------------------------------------------------------------- */

app.listen(PORT, () =>
  console.log(`✅ http://localhost:${PORT} | 📄 /api-docs`)
);
