// app.js – Mock de pasarela de pagos (v 2.0.0)
require('dotenv').config();
const express      = require('express');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi    = require('swagger-ui-express');

/* Rutas */
const pagoRoutes = require('./routes/pago');
const credRoutes = require('./routes/credenciales');
const notiRoutes = require('./routes/notificacion');

const PORT = process.env.PORT || 5578;
const app  = express();

app.use(express.json());
app.use('/api/pago',           pagoRoutes);            // generar / consultar
app.use('/api',                credRoutes);            // credencialesCliente
app.use('/api/webhookIzipay',  notiRoutes);            // webhook

/* ---------- Swagger --------------------------------------------------- */
const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title:   'Pasarela de Pagos Estática (Mock)',
      version: '2.0.0',
      description:
        'Servicio mock para registrar/actualizar credenciales, generar pagos (QR, link, etc.), consultar estado y procesar notificación Izipay.'
    },
    components: {
      schemas: {
        /* 🔐 Credenciales */
        CredencialesRequest: {
          type: 'object',
          required: [
            'dominio','subdominio','local_id','tipoProveedor',
            'codComercio','apikey','idunico','hashSecret',
            'telefono','activo'
          ],
          properties: {
            dominio:       { type:'string', example:'demo.com' },
            subdominio:    { type:'string', example:'default' },
            local_id:      { type:'string', example:'12' },
            tipoProveedor: { type:'string', example:'IziPay' },
            codComercio:   { type:'string', example:'8756944' },
            apikey:        { type:'string', example:'D45B7C88-D7E2-4E9E-B170-3B66F4225BDD' },
            idunico:       { type:'string', example:'IZIAPY_NEW' },
            hashSecret:    { type:'string', example:'A1B2...' },
            telefono:      { type:'string', example:'978548445' },
            activo:        { type:'boolean', example:true }
          }
        },

        /* 🧾 Generar pago */
        GenerarPagoRequest: {
          type: 'object',
          required: [
            'dominio','subdominio','localId',
            'monto','tipoMoneda','tipoProveedor','canalDePago'
          ],
          properties: {
            dominio:       { type:'string', example:'demo.com' },
            subdominio:    { type:'string', example:'defaultdemo.com' },
            localId:       { type:'string', example:'12' },
            monto:         { type:'number', example:1.00 },
            tipoMoneda:    { type:'string', example:'PEN' },
            tipoProveedor: { type:'string', example:'IZIPAY' },
            canalDePago:   { type:'string', example:'qr' }
          }
        },
        GenerarPagoResponse: {
          type: 'object',
          properties: {
            status:  { type:'boolean', example:true },
            code:    { type:'string',  example:'CREATED' },
            message: { type:'string',  example:'Pago generado correctamente' },
            data:    {
              type:'object',
              properties:{
                identificador:{type:'string',example:'8756944…'},
                monto:{type:'number',example:1.00},
                tipoMoneda:{type:'string',example:'PEN'},
                qrUrl:{type:'string'},
                estado:{type:'string',example:'Pendiente'},
                createdAt:{type:'string'},
                updatedAt:{type:'string'},
                __v:{type:'number'}
              }
            }
          }
        },

        /* 📤 Consultar estado */
        ConsultarPagoResponse: {
          type:'object',
          properties:{
            status:{type:'boolean',example:true},
            code:{type:'string',example:'OK'},
            message:{type:'string',example:'Pago No realizado'},
            data:{
              type:'object',
              properties:{
                estado:{type:'string',example:'Pendiente'}
              }
            }
          }
        },

        /* 🔔 Webhook Izipay */
        NotificacionQRBody: {
          type:'object',
          required:[
            'identificarQR','estado','codigo_estado','monto',
            'tipoMoneda','fechaTxn','horaTxn','numPedido','canalDePago'
          ],
          properties:{
            identificarQR:{type:'string'},
            estado:{type:'string',enum:['Aprobado','Rechazado']},
            codigo_estado:{type:'string',example:'00'},
            monto:{type:'number'},
            tipoMoneda:{type:'string',example:'PEN'},
            fechaTxn:{type:'string'},
            horaTxn:{type:'string'},
            numPedido:{type:'string'},
            canalDePago:{type:'string',example:'qr'}
          }
        },
        NotificacionResponse:{
          type:'object',
          properties:{
            status:{type:'boolean',example:true},
            code:{type:'string',example:'CREATED'},
            message:{type:'string',example:'Notificación registrada correctamente'},
            data:{
              type:'object',
              properties:{
                idTransaccion:{type:'integer',example:99999}
              }
            }
          }
        }
      }
    }
  },
  apis:['./routes/*.js']
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
/* ---------------------------------------------------------------------- */

app.listen(PORT, () =>
  console.log(`✅ http://localhost:${PORT} | 📄 /api-docs`)
);
