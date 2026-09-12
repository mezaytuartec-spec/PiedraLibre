/* ============================================================================
   PIEDRA LIBRE — aviso de pago de Mercado Pago
   ----------------------------------------------------------------------------
   Mercado Pago llama a esta dirección solo, cada vez que algo cambia en un
   pago (se creó, se aprobó, se rechazó...). Acá se revisa si ese pago está
   APROBADO y, si lo está, se mandan los dos mails: uno a la tienda con el
   pedido completo, y uno al comprador confirmando la compra.

   Variables de entorno que necesita (se cargan en Vercel, nunca acá):
     MP_ACCESS_TOKEN      el mismo que usa "crear-preferencia.js"
     GMAIL_USER            la cuenta de Gmail que manda los mails
                            (piedralibremerlo@gmail.com)
     GMAIL_APP_PASSWORD    la "contraseña de aplicación" de esa cuenta
                            (no es la contraseña normal de Gmail — se genera
                            en https://myaccount.google.com/apppasswords)
   ========================================================================== */
import { MercadoPagoConfig, Payment } from 'mercadopago';
import nodemailer from 'nodemailer';

const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });

function pesos(n) {
  return '$' + Number(n || 0).toLocaleString('es-AR', { maximumFractionDigits: 0 });
}

function armarTransporte() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD }
  });
}

export default async function handler(req, res) {
  /* Mercado Pago espera una respuesta rápida (si tarda mucho, reintenta el
     aviso más tarde pensando que falló). Contestamos "recibido" enseguida
     y el trabajo de mandar los mails sigue después, ya sin que Mercado
     Pago esté esperando. */
  res.status(200).send('ok');

  try {
    const tipo = req.query.type || req.query.topic;
    const pagoId = req.query['data.id'] || req.query.id;
    if (tipo !== 'payment' || !pagoId) { return; }

    const payment = new Payment(client);
    const pago = await payment.get({ id: pagoId });

    if (pago.status !== 'approved') { return; }

    const meta = pago.metadata || {};
    let items = [];
    try { items = JSON.parse(meta.pedido || '[]'); } catch (e) { items = []; }

    const detalleItems = items.map((it) => '- ' + it.t + ' x' + it.q + ': ' + pesos(it.p)).join('\n') || '(sin detalle)';
    const envioTexto = Number(meta.envio_precio) > 0
      ? meta.envio_nombre + ' — ' + pesos(meta.envio_precio) + '\n' + meta.envio_direccion + ', ' + meta.envio_localidad + ', ' + meta.envio_provincia + (meta.envio_cp ? ' (CP ' + meta.envio_cp + ')' : '')
      : (meta.envio_nombre || 'Retiro en el local');

    const payerEmail = pago.payer && pago.payer.email;
    const total = pago.transaction_amount;

    const transporte = armarTransporte();

    /* Mail a la tienda, con todo lo que hace falta para armar el pedido. */
    await transporte.sendMail({
      from: process.env.GMAIL_USER,
      to: process.env.GMAIL_USER,
      subject: 'Pago aprobado — ' + (meta.comprador_nombre || 'nuevo pedido'),
      text:
        'Se aprobó un pago nuevo (ID ' + pagoId + ').\n\n' +
        'PEDIDO:\n' + detalleItems + '\n\n' +
        'Total: ' + pesos(total) + '\n\n' +
        'Comprador: ' + (meta.comprador_nombre || '-') + ' (' + (meta.comprador_telefono || '-') + ')\n' +
        'Mail: ' + (payerEmail || '-') + '\n\n' +
        'Envío:\n' + envioTexto
    });

    /* Mail al comprador — sólo si Mercado Pago nos dio su mail (siempre
       debería, ya que lo pide para poder pagar). */
    if (payerEmail) {
      await transporte.sendMail({
        from: process.env.GMAIL_USER,
        to: payerEmail,
        subject: '¡Gracias por tu compra en Piedra Libre!',
        text:
          'Hola' + (meta.comprador_nombre ? ' ' + meta.comprador_nombre : '') + '!\n\n' +
          'Tu pago se acreditó correctamente. Este es el resumen de tu pedido:\n\n' +
          detalleItems + '\n\n' +
          'Total: ' + pesos(total) + '\n\n' +
          'Envío:\n' + envioTexto + '\n\n' +
          'En breve nos ponemos en contacto para coordinar todo. Cualquier consulta, escribinos por WhatsApp.\n\n' +
          '¡Gracias por elegirnos!\nPiedra Libre · Los Molles'
      });
    }
  } catch (err) {
    console.error('[webhook-pago] error:', err);
  }
}
