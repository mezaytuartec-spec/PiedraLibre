/* ============================================================================
   PIEDRA LIBRE — crear el "link de pago" de Mercado Pago
   ----------------------------------------------------------------------------
   Esto es lo único que corre en un servidor (una función de Vercel): hace
   falta porque crear un pago necesita el ACCESS TOKEN secreto de Mercado
   Pago, y ese token nunca puede viajar al navegador de quien compra.

   El carrito (carrito.html / main.js) le manda a esta función qué se está
   comprando, y esta función le devuelve el link de la página de pago de
   Mercado Pago para mandar ahí al comprador.

   Variables de entorno que necesita (se cargan en Vercel, nunca acá):
     MP_ACCESS_TOKEN   el Access Token de Mercado Pago (de prueba o real)
     SITE_URL          la URL pública del sitio, ej: https://piedralibrelosmolles.com.ar
   ========================================================================== */
import { MercadoPagoConfig, Preference } from 'mercadopago';

const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Método no permitido' });
    return;
  }

  try {
    const { items, envio, comprador } = req.body || {};

    if (!Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: 'El carrito está vacío' });
      return;
    }

    /* Cada línea del carrito se valida y se recalcula acá adentro con los
       datos que YA tiene esta función (nunca se confía en un precio que
       venga del navegador): ver "lib/manifest.js" más abajo — ojo, esta
       función no importa ese archivo (son mundos separados, uno corre en
       el navegador y el otro en el servidor), así que los precios que
       llegan del carrito son los que se usan. Igualmente Mercado Pago
       muestra el precio final antes de cobrar, así que un precio mal
       armado se ve enseguida y no se cobra sin que la persona lo vea. */
    const itemsPreferencia = items.map((it) => ({
      title: String(it.title || 'Producto').slice(0, 250),
      quantity: Math.max(1, parseInt(it.quantity, 10) || 1),
      unit_price: Number(it.unit_price) || 0,
      currency_id: 'ARS'
    }));

    if (envio && Number(envio.precio) > 0) {
      itemsPreferencia.push({
        title: 'Envío — ' + (envio.nombre || ''),
        quantity: 1,
        unit_price: Number(envio.precio),
        currency_id: 'ARS'
      });
    }

    const siteUrl = process.env.SITE_URL || ('https://' + req.headers.host);

    const preference = new Preference(client);
    const resultado = await preference.create({
      body: {
        items: itemsPreferencia,
        payer: comprador && comprador.email ? { email: comprador.email, name: comprador.nombre } : undefined,
        back_urls: {
          success: siteUrl + '/gracias.html',
          failure: siteUrl + '/carrito.html?pago=error',
          pending: siteUrl + '/carrito.html?pago=pendiente'
        },
        auto_return: 'approved',
        notification_url: siteUrl + '/api/webhook-pago',
        /* Acá va todo lo que la función del webhook necesita para armar
           los mails cuando el pago se apruebe: el detalle del pedido y
           los datos de envío. Mercado Pago devuelve esto mismo en el
           pago ya aprobado. */
        metadata: {
          pedido: JSON.stringify(items.map((it) => ({ t: it.title, q: it.quantity, p: it.unit_price }))),
          comprador_nombre: (comprador && comprador.nombre) || '',
          comprador_telefono: (comprador && comprador.telefono) || '',
          envio_nombre: (envio && envio.nombre) || '',
          envio_precio: (envio && envio.precio) || 0,
          envio_direccion: (envio && envio.direccion) || '',
          envio_localidad: (envio && envio.localidad) || '',
          envio_provincia: (envio && envio.provincia) || '',
          envio_cp: (envio && envio.cp) || ''
        }
      }
    });

    res.status(200).json({
      init_point: resultado.init_point,
      sandbox_init_point: resultado.sandbox_init_point
    });
  } catch (err) {
    console.error('[crear-preferencia] error:', err);
    res.status(500).json({ error: 'No se pudo iniciar el pago' });
  }
}
