/* ============================================================================
   PIEDRA LIBRE · LOS MOLLES — main.js
   JavaScript vanilla, sin dependencias, sin módulos.
   Cada bloque va dentro de su propio try/catch: si uno falla, el resto sigue.
   ============================================================================ */
(function () {
  'use strict';

  var B = window.__BRAND__ || {};
  var M = B.marca || {};
  var C = B.condiciones || {};
  var MSG = B.mensajes || {};

  /* --------------------------------------------------------------- utilidades */
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  function safe(nombre, fn) {
    try { fn(); } catch (e) {
      if (window.console && console.warn) { console.warn('[Piedra Libre] falló ' + nombre + ':', e); }
    }
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function pesos(n) {
    var num = Number(n) || 0;
    try {
      return '$' + num.toLocaleString('es-AR', { maximumFractionDigits: 0 });
    } catch (e) {
      return '$' + String(num).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    }
  }

  function wa(texto) {
    var num = (B.whatsapp || '').replace(/\D/g, '');
    return 'https://wa.me/' + num + '?text=' + encodeURIComponent(texto || MSG.generico || 'Hola!');
  }

  function catPorId(id) {
    var lista = B.categorias || [];
    for (var i = 0; i < lista.length; i++) { if (lista[i].id === id) { return lista[i]; } }
    return null;
  }

  function productoPorId(id) {
    var lista = B.productos || [];
    for (var i = 0; i < lista.length; i++) { if (lista[i].id === id) { return lista[i]; } }
    return null;
  }

  function subNombre(catId, subId) {
    var c = catPorId(catId);
    if (!c) { return subId; }
    for (var i = 0; i < c.subs.length; i++) { if (c.subs[i].id === subId) { return c.subs[i].nombre; } }
    return subId;
  }

  /* Lee un parámetro de la URL, ej: parametroURL('id') para "?id=body-sapo".
     Mismo mecanismo (sin URLSearchParams) que ya usa el catálogo con filtros. */
  function parametroURL(nombre) {
    var q = window.location.search.replace(/^\?/, '').split('&');
    for (var i = 0; i < q.length; i++) {
      var kv = q[i].split('=');
      if (decodeURIComponent(kv[0] || '') === nombre) { return decodeURIComponent(kv[1] || ''); }
    }
    return '';
  }

  /* Convierte el texto de talles ("2 al 12", "01 al 04", "Único") en la
     lista de talles que se pueden elegir uno por uno en la ficha del
     producto. Los talles de bebé van de 1 en 1; los de niños y niñas, de
     2 en 2 (2, 4, 6...), que es como vienen cortados de verdad. */
  function tallesDisponibles(texto) {
    if (!texto) { return []; }
    if (texto.trim().toLowerCase() === 'único') { return ['Único']; }
    var m = texto.match(/(\d+)\s*al\s*(\d+)/i);
    if (!m) { return [texto]; }
    var desde = parseInt(m[1], 10), hasta = parseInt(m[2], 10);
    var paso = hasta <= 4 ? 1 : 2;
    var out = [];
    for (var t = desde; t <= hasta; t += paso) { out.push(t); }
    return out;
  }

  /* ==========================================================================
     CARRITO — en localStorage, sin cuentas ni servidor. Cada línea guarda
     sólo { id, talle, color, cantidad }: el precio y el resto de los datos
     del producto se buscan siempre en vivo por id, así nunca quedan
     desactualizados si cambia un precio acá en este archivo.
     ========================================================================== */
  var CARRITO_KEY = 'pl_carrito';

  function carritoLeer() {
    try {
      var items = JSON.parse(window.localStorage.getItem(CARRITO_KEY) || '[]');
      return Array.isArray(items) ? items : [];
    } catch (e) { return []; }
  }

  function carritoGuardar(items) {
    try { window.localStorage.setItem(CARRITO_KEY, JSON.stringify(items)); } catch (e) {}
    try { document.dispatchEvent(new CustomEvent('carrito:cambio')); } catch (e) {}
  }

  function carritoAgregar(id, talle, color, cantidad) {
    var items = carritoLeer();
    for (var i = 0; i < items.length; i++) {
      if (items[i].id === id && items[i].talle === talle && items[i].color === color) {
        items[i].cantidad += cantidad;
        carritoGuardar(items);
        return;
      }
    }
    items.push({ id: id, talle: talle, color: color, cantidad: cantidad });
    carritoGuardar(items);
  }

  function carritoQuitar(indice) {
    var items = carritoLeer();
    items.splice(indice, 1);
    carritoGuardar(items);
  }

  function carritoActualizarCantidad(indice, cantidad) {
    var items = carritoLeer();
    if (!items[indice]) { return; }
    items[indice].cantidad = Math.max(1, cantidad | 0);
    carritoGuardar(items);
  }

  function carritoVaciar() { carritoGuardar([]); }

  function carritoContarItems() {
    var items = carritoLeer(), n = 0;
    for (var i = 0; i < items.length; i++) { n += items[i].cantidad; }
    return n;
  }

  function carritoSubtotal(items) {
    var total = 0;
    for (var i = 0; i < items.length; i++) {
      var p = productoPorId(items[i].id);
      if (p) { total += p.precio * items[i].cantidad; }
    }
    return total;
  }

  var ICONO_WA = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">' +
    '<path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.9-4.45 9.9-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 18.02h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.11.82.83-3.04-.2-.31a8.22 8.22 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.24-8.23 2.2 0 4.27.86 5.82 2.42a8.17 8.17 0 0 1 2.41 5.82c0 4.54-3.69 8.23-8.23 8.23Zm4.52-6.16c-.25-.13-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.8-.78.97-.15.16-.29.18-.53.06-.25-.13-1.05-.39-1.99-1.23-.74-.65-1.23-1.46-1.38-1.71-.14-.24-.01-.37.11-.5.11-.11.25-.29.37-.44.13-.15.17-.25.25-.41.09-.17.04-.31-.02-.44-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43h-.47c-.16 0-.43.06-.65.31-.23.24-.86.84-.86 2.05s.88 2.38 1 2.54c.13.17 1.74 2.65 4.2 3.72.59.25 1.05.4 1.4.52.59.19 1.13.16 1.55.1.47-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.06-.1-.23-.17-.47-.29Z"/></svg>';

  /* ==========================================================================
     1) Quitar la clase no-js
     ========================================================================== */
  safe('no-js', function () {
    document.documentElement.classList.remove('no-js');
    document.documentElement.classList.add('js');
  });

  /* ==========================================================================
     2) Placeholders de imagen
     Intenta cargar la foto real. Si existe, reemplaza el recuadro.
     Si no existe, el recuadro queda con las instrucciones a la vista.
     ========================================================================== */
  function cargarFotos(ctx) {
    $$('.ph[data-img]', ctx).forEach(function (ph) {
      if (ph.getAttribute('data-probado') === '1') { return; }
      ph.setAttribute('data-probado', '1');
      var src = ph.getAttribute('data-img');
      if (!src) { return; }
      var probe = new Image();
      probe.onload = function () {
        if (!probe.naturalWidth) { return; }
        var img = document.createElement('img');
        img.src = src;
        img.alt = ph.getAttribute('data-alt') || '';
        img.loading = 'lazy';
        img.decoding = 'async';
        ph.innerHTML = '';
        ph.appendChild(img);
        ph.classList.add('ph--cargado');
      };
      probe.src = src;
    });
  }

  /* Genera el HTML de un recuadro placeholder */
  function phHTML(opts) {
    var ar = opts.ar || '4x5';
    var medidas = { '4x5': '1000 × 1250 px', '5x4': '1200 × 960 px', '16x9': '1600 × 900 px', '1x1': '800 × 800 px' };
    return '<div class="ph ph--' + ar + '" style="--tint:' + (opts.tint || 'var(--t-tinta)') + '"' +
      ' data-img="' + esc(opts.src) + '" data-alt="' + esc(opts.alt || opts.nombre) + '">' +
        '<span class="ph__tag">FOTO</span>' +
        '<span class="ph__nombre">' + esc(opts.nombre) + '</span>' +
        '<span class="ph__medida">' + medidas[ar] + '</span>' +
        '<code class="ph__ruta">' + esc(opts.src) + '</code>' +
      '</div>';
  }

  var TINTES = { bebes: 'var(--t-sol)', ninas: 'var(--t-fucsia)', ninos: 'var(--t-monte)', discontinuos: 'var(--t-violeta)' };

  /* ==========================================================================
     3) Tarjeta de producto
     ========================================================================== */
  function tarjetaProducto(p) {
    var cat = catPorId(p.cat) || {};
    var color = cat.color || '#221F1A';
    var acento = cat.colorTexto || cat.color || '#221F1A';
    var transf = Math.round(p.precio * (1 - (C.descTransferencia || 0) / 100));
    var cuota = Math.round(p.precio / (C.cuotas || 3));
    var mapaColores = B.colores || {};

    var puntos = (p.colores || []).map(function (n) {
      var v = mapaColores[n];
      if (v === 'tricolor') {
        return '<span class="punto punto--tricolor" title="' + esc(n) + '"></span>';
      }
      return '<span class="punto" style="background:' + esc(v || '#ccc') + '" title="' + esc(n) + '"></span>';
    }).join('');

    var liq = p.precioAntes > 0;
    var pdpHref = 'producto.html?id=' + esc(p.id);

    /* Tocar la tarjeta (foto, nombre, precio) lleva a la ficha del producto,
       donde se elige talle y color de verdad y se agrega al carrito o se
       compra. ".prod__link" envuelve todo eso en un solo <a> con
       "display:contents" (ver CSS) para que el link no le cambie el
       acomodo a nada de adentro. Las dos acciones de abajo (Ver producto /
       Consultar) quedan afuera de ese link, como hermanas, porque HTML no
       permite un <a> adentro de otro <a>. */
    return '' +
      '<article class="prod reveal" style="--sombra:' + color + ';--acento:' + acento + '">' +
        '<a class="prod__link" href="' + pdpHref + '" aria-label="Ver ' + esc(p.nombre) + '">' +
          phHTML({ src: p.img, nombre: p.nombre, alt: p.nombre + ' — Piedra Libre', ar: '4x5', tint: TINTES[p.cat] }) +
          '<div class="prod__cuerpo">' +
            (liq ? '<span class="cinta-liq">Liquidación</span>' : '') +
            '<p class="prod__sub">' + esc(subNombre(p.cat, p.sub)) + '</p>' +
            '<h3 class="prod__nombre">' + esc(p.nombre) + '</h3>' +
            '<p class="prod__talles">Talles ' + esc(p.talles) + '</p>' +
            '<div class="prod__colores" aria-hidden="true">' + puntos + '</div>' +
            '<p class="prod__colores-txt">Colores: ' + esc((p.colores || []).join(', ')) + '</p>' +
            '<div class="prod__precios">' +
              '<p class="prod__precio">' + pesos(p.precio) +
                (liq ? '<span class="prod__antes">' + pesos(p.precioAntes) + '</span>' : '') +
              '</p>' +
              '<p class="prod__transf">' + pesos(transf) + ' con transferencia</p>' +
              '<p class="prod__cuotas">' + (C.cuotas || 3) + ' cuotas sin interés de ' + pesos(cuota) + '</p>' +
            '</div>' +
          '</div>' +
        '</a>' +
        '<div class="prod__acciones">' +
          '<a class="btn btn--comprar" href="' + pdpHref + '">Ver producto<span class="solo-lectores"> ' + esc(p.nombre) + '</span></a>' +
          '<a class="btn btn--monte" href="' + esc(wa(MSG.producto ? MSG.producto(p.nombre) : p.nombre)) + '"' +
            ' target="_blank" rel="noopener" aria-label="Consultar por WhatsApp por ' + esc(p.nombre) + '">' + ICONO_WA +
            '<span aria-hidden="true">Consultar<span class="btn__extra"> por WhatsApp</span></span></a>' +
        '</div>' +
      '</article>';
  }

  /* ==========================================================================
     4) Links de WhatsApp declarativos:  <a data-wa>  o  <a data-wa="texto">
     ========================================================================== */
  safe('links wa', function () {
    $$('[data-wa]').forEach(function (a) {
      var txt = a.getAttribute('data-wa');
      a.href = wa(txt || MSG.generico);
      a.target = '_blank';
      a.rel = 'noopener';
    });
  });

  /* ==========================================================================
     5) Rellenar datos de marca:  <span data-marca="direccion">
     ========================================================================== */
  safe('datos marca', function () {
    var mapa = {
      nombre: M.nombre,
      bio: M.bio,
      mail: M.mail,
      instagram: '@' + (M.instagram || ''),
      direccion: M.direccion,
      localidad: M.localidad,
      provincia: M.provincia,
      direccionCompleta: [M.direccion, M.localidad, M.provincia].filter(Boolean).join(', '),
      cp: M.cp,
      plusCode: M.plusCode,
      rating: String(M.google ? M.google.rating : '').replace('.', ','),
      reviews: M.google ? M.google.reviews : '',
      cuotas: C.cuotas,
      descTransferencia: C.descTransferencia + '%',
      envioGratisDesde: pesos(C.envioGratisDesde),
      pagosEnLocal: (M.pagosEnLocal || []).join(' · ')
    };
    $$('[data-marca]').forEach(function (el) {
      var k = el.getAttribute('data-marca');
      if (mapa[k] !== undefined && mapa[k] !== null) { el.textContent = mapa[k]; }
    });
    $$('[data-href]').forEach(function (a) {
      var k = a.getAttribute('data-href');
      var urls = {
        instagram: M.instagramUrl,
        facebook: M.facebookUrl,
        google: M.google ? M.google.url : '',
        mail: 'mailto:' + M.mail,
        comoLlegar: 'https://www.google.com/maps/dir/?api=1&destination=' +
          encodeURIComponent([M.direccion, M.localidad, M.provincia, M.pais].filter(Boolean).join(', ')),
        tienda: M.tiendanube
      };
      if (urls[k]) { a.href = urls[k]; }
      else if (k === 'tienda') { a.parentNode && a.parentNode.removeChild(a); }
    });
  });

  /* ==========================================================================
     6) Mapa embebido (sin API key)
     ========================================================================== */
  safe('mapa', function () {
    var cont = $('#mapa-local');
    if (!cont) { return; }
    var q = encodeURIComponent([M.direccion, M.localidad, M.provincia, M.pais].filter(Boolean).join(', '));
    var iframe = document.createElement('iframe');
    iframe.src = 'https://www.google.com/maps?q=' + q + '&z=15&output=embed';
    iframe.title = 'Mapa con la ubicación de Piedra Libre en ' + (M.direccion || '') + ', ' + (M.localidad || '');
    iframe.loading = 'lazy';
    iframe.referrerPolicy = 'no-referrer-when-downgrade';
    iframe.setAttribute('allowfullscreen', '');
    cont.appendChild(iframe);
  });

  /* ==========================================================================
     7) Tira en movimiento
     ========================================================================== */
  safe('tira', function () {
    var pista = $('#tira-pista');
    if (!pista) { return; }
    var nombres = B.tira || [];
    var grupo = '<div class="tira__grupo">' + nombres.map(function (n) {
      return '<span>' + esc(n) + '</span>';
    }).join('') + '</div>';
    pista.innerHTML = grupo + grupo;   /* duplicado para que el loop sea continuo */
  });

  /* ==========================================================================
     8) Categorías (home)
     ========================================================================== */
  safe('categorias', function () {
    var cont = $('#grid-cats');
    if (!cont) { return; }
    var visibles = (B.categorias || []).filter(function (c) { return c.id !== 'discontinuos'; });
    /* La tarjeta entera es un solo <a>: antes sólo se podía tocar el link
       "Ver X" del final, y en el celular ese blanco chico era difícil de
       acertar. aria-label le da al lector de pantalla un nombre corto en
       vez de leer la tarjeta entera (título + talles + descripción + chips)
       como si fuera el texto del link. */
    cont.innerHTML = visibles.map(function (c) {
      return '' +
        '<a class="cat reveal" href="productos.html?cat=' + esc(c.id) + '"' +
          ' aria-label="Ver ' + esc(c.nombre.toLowerCase()) + '"' +
          ' style="--sombra:' + c.color + ';--acento:' + (c.colorTexto || c.color) + '">' +
          phHTML({ src: c.img, nombre: c.nombre, alt: c.imgAlt, ar: '5x4', tint: TINTES[c.id] }) +
          '<div class="cat__cuerpo">' +
            '<h3>' + esc(c.nombre) + '</h3>' +
            '<p class="cat__talles">Talles ' + esc(c.talles) + '</p>' +
            '<p class="cat__txt">' + esc(c.texto) + '</p>' +
            '<ul class="chips">' + c.subs.map(function (s) {
              return '<li class="chip-lbl">' + esc(s.nombre) + '</li>';
            }).join('') + '</ul>' +
            '<span class="enlace-flecha" aria-hidden="true">' +
              'Ver ' + esc(c.nombre.toLowerCase()) + ' <span aria-hidden="true">&rarr;</span></span>' +
          '</div>' +
        '</a>';
    }).join('');
  });

  /* ==========================================================================
     9) Destacados (home)
     ========================================================================== */
  safe('destacados', function () {
    var cont = $('#grid-destacados');
    if (!cont) { return; }
    var destacados = (B.productos || []).filter(function (p) { return p.destacado; }).slice(0, 6);
    if (!destacados.length) { destacados = (B.productos || []).slice(0, 6); }
    cont.innerHTML = destacados.map(tarjetaProducto).join('');
  });

  /* ==========================================================================
     10) Opiniones
     ========================================================================== */
  safe('opiniones', function () {
    var cont = $('#grid-opiniones');
    if (!cont) { return; }
    cont.innerHTML = (B.opiniones || []).map(function (o) {
      var n = Math.max(0, Math.min(5, o.estrellas || 5));
      var estrellas = new Array(n + 1).join('★') + new Array(6 - n).join('☆');
      return '' +
        '<article class="opinion reveal">' +
          '<p class="estrellas" aria-hidden="true">' + estrellas + '</p>' +
          '<p class="solo-lectores">' + n + ' de 5 estrellas</p>' +
          '<p>“' + esc(o.texto) + '”</p>' +
          '<footer><strong>' + esc(o.nombre) + '</strong>' + esc(o.fecha) + ' · Google</footer>' +
        '</article>';
    }).join('');
  });

  /* ==========================================================================
     11) Preguntas frecuentes + su JSON-LD para Google
     ========================================================================== */
  safe('faq', function () {
    var cont = $('#faq');
    if (!cont) { return; }
    var faqs = B.faqs || [];

    cont.innerHTML = faqs.map(function (f, i) {
      return '' +
        '<div class="faq__item">' +
          '<h3>' +
            '<button class="faq__b" type="button" aria-expanded="false" aria-controls="faq-p-' + i + '" id="faq-b-' + i + '">' +
              '<span>' + esc(f.q) + '</span>' +
              '<span class="faq__mas" aria-hidden="true"></span>' +
            '</button>' +
          '</h3>' +
          '<div class="faq__panel" id="faq-p-' + i + '" role="region" aria-labelledby="faq-b-' + i + '">' +
            '<div><p>' + esc(f.a) + '</p></div>' +
          '</div>' +
        '</div>';
    }).join('');

    /* Un solo panel abierto a la vez */
    $$('.faq__b', cont).forEach(function (btn) {
      btn.addEventListener('click', function () {
        var abierto = btn.getAttribute('aria-expanded') === 'true';
        $$('.faq__b', cont).forEach(function (o) {
          o.setAttribute('aria-expanded', 'false');
          var p = document.getElementById(o.getAttribute('aria-controls'));
          if (p) { p.classList.remove('is-open'); }
        });
        if (!abierto) {
          btn.setAttribute('aria-expanded', 'true');
          var panel = document.getElementById(btn.getAttribute('aria-controls'));
          if (panel) { panel.classList.add('is-open'); }
        }
      });
    });

    /* Datos estructurados FAQPage */
    var ld = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map(function (f) {
        return {
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a }
        };
      })
    };
    var s = document.createElement('script');
    s.type = 'application/ld+json';
    s.textContent = JSON.stringify(ld);
    document.head.appendChild(s);
  });

  /* ==========================================================================
     12) JSON-LD del negocio (ClothingStore)
     ========================================================================== */
  safe('jsonld negocio', function () {
    if (!M.nombre) { return; }
    var sameAs = [M.instagramUrl, M.facebookUrl].filter(Boolean);
    var ld = {
      '@context': 'https://schema.org',
      '@type': 'ClothingStore',
      name: M.nombre + ' Los Molles',
      description: M.bio,
      url: M.sitio,
      image: (M.sitio || '') + '/assets/img/og-piedra-libre.jpg',
      telephone: '+' + (B.whatsapp || ''),
      email: M.mail,
      priceRange: '$$',
      address: {
        '@type': 'PostalAddress',
        streetAddress: M.direccion,
        addressLocality: M.localidad,
        addressRegion: M.provincia,
        postalCode: M.cp,
        addressCountry: 'AR'
      },
      geo: { '@type': 'GeoCoordinates', latitude: M.lat, longitude: M.lng },
      openingHours: M.horariosSchema || [],
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: M.google ? M.google.rating : 5,
        reviewCount: M.google ? M.google.reviews : 0,
        bestRating: 5
      },
      sameAs: sameAs
    };
    var s = document.createElement('script');
    s.type = 'application/ld+json';
    s.textContent = JSON.stringify(ld);
    document.head.appendChild(s);
  });

  /* ==========================================================================
     13) Catálogo con filtros (productos.html)
     ========================================================================== */
  safe('catalogo', function () {
    var grid = $('#grid-catalogo');
    if (!grid) { return; }

    var filaCat = $('#filtros-cat');
    var filaSub = $('#filtros-sub');
    var contador = $('#contador');
    var cats = B.categorias || [];

    var estado = { cat: 'todos', sub: 'todos' };

    /* leer la URL al cargar */
    function leerURL() {
      var q = window.location.search.replace(/^\?/, '').split('&');
      for (var i = 0; i < q.length; i++) {
        var kv = q[i].split('=');
        var k = decodeURIComponent(kv[0] || '');
        var v = decodeURIComponent(kv[1] || '');
        if (k === 'cat' && v) { estado.cat = v; }
        if (k === 'sub' && v) { estado.sub = v; }
      }
      if (estado.cat !== 'todos' && !catPorId(estado.cat)) { estado.cat = 'todos'; }
    }

    function escribirURL() {
      if (!window.history || !window.history.replaceState) { return; }
      var p = [];
      if (estado.cat !== 'todos') { p.push('cat=' + encodeURIComponent(estado.cat)); }
      if (estado.sub !== 'todos') { p.push('sub=' + encodeURIComponent(estado.sub)); }
      var url = window.location.pathname + (p.length ? '?' + p.join('&') : '') + window.location.hash;
      window.history.replaceState(null, '', url);
    }

    function chip(id, texto, activo, color) {
      return '<button type="button" class="chip" data-valor="' + esc(id) + '"' +
        ' aria-pressed="' + (activo ? 'true' : 'false') + '"' +
        (color ? ' style="--acento:' + color + '"' : '') + '>' + esc(texto) + '</button>';
    }

    function pintarChipsCat() {
      filaCat.innerHTML = '<span class="filtros__et">Categoría</span>' +
        chip('todos', 'Todos', estado.cat === 'todos', '#E05B26') +
        cats.map(function (c) { return chip(c.id, c.nombre, estado.cat === c.id, c.color); }).join('');
    }

    function pintarChipsSub() {
      var c = catPorId(estado.cat);
      if (!c) { filaSub.hidden = true; filaSub.innerHTML = ''; return; }
      filaSub.hidden = false;
      filaSub.innerHTML = '<span class="filtros__et">Tipo</span>' +
        chip('todos', 'Todo ' + c.nombre.toLowerCase(), estado.sub === 'todos', c.color) +
        c.subs.map(function (s) { return chip(s.id, s.nombre, estado.sub === s.id, c.color); }).join('');
    }

    function filtrar() {
      return (B.productos || []).filter(function (p) {
        if (estado.cat !== 'todos' && p.cat !== estado.cat) { return false; }
        if (estado.sub !== 'todos' && p.sub !== estado.sub) { return false; }
        return true;
      });
    }

    function pintarGrid() {
      var lista = filtrar();
      if (contador) {
        contador.textContent = lista.length === 1 ? '1 prenda' : lista.length + ' prendas';
      }
      if (!lista.length) {
        grid.innerHTML = '<div class="vacio">' +
          /* Sin loading="lazy": este gato se inserta justo donde el usuario está
             mirando, así que diferirlo no ahorra nada y en algunos casos la
             carga diferida no llega a dispararse y la imagen queda en blanco. */
          '<img class="vacio__gato" src="assets/img/mascota-gato.webp?v=20260826" alt=""' +
            ' width="700" height="669" decoding="async">' +
          '<h3>No hay prendas con ese filtro</h3>' +
          '<p class="bajada">Probá con otra categoría, o escribinos y te decimos qué tenemos.</p>' +
          '<p style="margin-top:1.2rem"><a class="btn btn--monte" data-wa target="_blank" rel="noopener" href="' +
            esc(wa(MSG.generico)) + '">Escribinos por WhatsApp</a></p>' +
        '</div>';
        return;
      }
      grid.innerHTML = lista.map(tarjetaProducto).join('');
      cargarFotos(grid);
      observar(grid);
    }

    function render() {
      pintarChipsCat();
      pintarChipsSub();
      pintarGrid();
      escribirURL();
    }

    filaCat.addEventListener('click', function (ev) {
      var b = ev.target.closest ? ev.target.closest('.chip') : null;
      if (!b) { return; }
      estado.cat = b.getAttribute('data-valor');
      estado.sub = 'todos';
      render();
    });

    filaSub.addEventListener('click', function (ev) {
      var b = ev.target.closest ? ev.target.closest('.chip') : null;
      if (!b) { return; }
      estado.sub = b.getAttribute('data-valor');
      render();
    });

    leerURL();
    render();
  });

  /* ==========================================================================
     13b) Ficha de producto (producto.html)
     Arma toda la página a partir de "?id=..." en la URL: foto, precio,
     selector de talle y color, guía de talles, agregar al carrito /
     comprar ahora, y una tira con otras prendas de la misma categoría
     para que siempre haya algo más para ver más abajo.
     ========================================================================== */
  safe('producto', function () {
    var cont = $('#pdp');
    if (!cont) { return; }

    var id = parametroURL('id');
    var p = productoPorId(id);

    if (!p) {
      cont.innerHTML =
        '<div class="wrap" style="padding-block:3rem">' +
          '<p class="bajada">No encontramos esa prenda. Puede que el link esté viejo.</p>' +
          '<p style="margin-top:1.2rem"><a class="enlace-flecha" href="productos.html">Ver todo el catálogo <span aria-hidden="true">→</span></a></p>' +
        '</div>';
      return;
    }

    document.title = p.nombre + ' · Piedra Libre';

    var cat = catPorId(p.cat) || {};
    var acento = cat.colorTexto || cat.color || '#221F1A';
    var mapaColores = B.colores || {};
    var talles = tallesDisponibles(p.talles);
    var liq = p.precioAntes > 0;
    var transf = Math.round(p.precio * (1 - (C.descTransferencia || 0) / 100));
    var cuota = Math.round(p.precio / (C.cuotas || 3));
    var guia = (B.talles || {})[p.guiaTalles];

    var opsColor = (p.colores || []).map(function (nombre, i) {
      var v = mapaColores[nombre];
      var muestra = v === 'tricolor'
        ? '<span class="color-op__sw color-op__sw--tricolor"></span>'
        : '<span class="color-op__sw" style="background:' + esc(v || '#ccc') + '"></span>';
      return '<button type="button" class="color-op' + (i === 0 ? ' is-activo' : '') + '" data-color="' + esc(nombre) + '">' +
        muestra + '<span>' + esc(nombre) + '</span></button>';
    }).join('');

    var opsTalle = talles.map(function (t, i) {
      return '<button type="button" class="talle-op' + (i === 0 ? ' is-activo' : '') + '" data-talle="' + esc(String(t)) + '">' + esc(String(t)) + '</button>';
    }).join('');

    var tablaGuia = '';
    if (guia) {
      tablaGuia =
        '<h3>' + esc(guia.titulo) + '</h3>' +
        '<div class="tabla-talles-wrap"><table class="tabla-talles">' +
          '<thead><tr>' + guia.col.map(function (c) { return '<th>' + esc(c) + '</th>'; }).join('') + '</tr></thead>' +
          '<tbody>' + guia.filas.map(function (fila) {
            return '<tr>' + fila.map(function (v) { return '<td>' + esc(String(v)) + '</td>'; }).join('') + '</tr>';
          }).join('') + '</tbody>' +
        '</table></div>' +
        '<p class="tabla-talles__notas">Medidas en cm. ' + guia.notas.map(esc).join(' ') + '</p>';
    }

    cont.innerHTML =
      '<div class="wrap pdp">' +
        '<p class="pdp__miga">' +
          '<a href="productos.html">Catálogo</a> <span aria-hidden="true">/</span> ' +
          '<a href="productos.html?cat=' + esc(p.cat) + '">' + esc(cat.nombre || '') + '</a> <span aria-hidden="true">/</span> ' +
          '<span aria-current="page">' + esc(p.nombre) + '</span>' +
        '</p>' +

        '<div class="pdp__grid">' +
          '<div class="reveal">' +
            phHTML({ src: p.img, nombre: p.nombre, alt: p.nombre + ' — Piedra Libre', ar: '4x5', tint: TINTES[p.cat] }) +
          '</div>' +

          '<div class="pdp__info" style="--acento:' + acento + '">' +
            '<p class="prod__sub">' + esc(subNombre(p.cat, p.sub)) + '</p>' +
            '<h1 class="pdp__nombre">' + esc(p.nombre) + '</h1>' +

            '<div class="pdp__precios">' +
              '<p class="pdp__precio">' + pesos(p.precio) + (liq ? '<span class="prod__antes">' + pesos(p.precioAntes) + '</span>' : '') + '</p>' +
              '<p class="prod__transf">' + pesos(transf) + ' con transferencia</p>' +
              '<p class="prod__cuotas">' + (C.cuotas || 3) + ' cuotas sin interés de ' + pesos(cuota) + '</p>' +
            '</div>' +

            (opsColor ? (
              '<div class="pdp__opcion">' +
                '<p class="pdp__etiqueta">Color<span class="pdp__valor" data-valor-color></span></p>' +
                '<div class="color-ops">' + opsColor + '</div>' +
              '</div>'
            ) : '') +

            '<div class="pdp__opcion">' +
              '<p class="pdp__etiqueta">Talle<span class="pdp__valor" data-valor-talle></span>' +
                (guia ? ' <button type="button" class="pdp__link-guia" data-abrir-guia>Ver guía de talles</button>' : '') +
              '</p>' +
              '<div class="talle-ops">' + opsTalle + '</div>' +
            '</div>' +

            '<div class="pdp__opcion">' +
              '<p class="pdp__etiqueta">Cantidad</p>' +
              '<div class="cantidad-stepper">' +
                '<button type="button" data-cant-menos aria-label="Restar uno">−</button>' +
                '<input type="text" inputmode="numeric" value="1" data-cant-valor readonly aria-label="Cantidad">' +
                '<button type="button" data-cant-mas aria-label="Sumar uno">+</button>' +
              '</div>' +
            '</div>' +

            '<div class="pdp__botones">' +
              '<button type="button" class="btn btn--zorro" data-comprar-ahora>Comprar ahora</button>' +
              '<button type="button" class="btn" data-agregar-carrito>Agregar al carrito</button>' +
            '</div>' +
            '<p class="pdp__aviso" data-aviso hidden>Se agregó al carrito.</p>' +

            '<a class="btn btn--monte pdp__wa" href="' + esc(wa(MSG.producto ? MSG.producto(p.nombre) : p.nombre)) + '" target="_blank" rel="noopener">' +
              ICONO_WA + '<span>Consultar por WhatsApp</span></a>' +

            '<ul class="pdp__garantias">' +
              '<li>Cambios dentro de los 30 días, sin usar y con la etiqueta puesta.</li>' +
              '<li>Envíos a todo el país. Gratis desde ' + pesos(C.envioGratisDesde) + '.</li>' +
              '<li>Pagás como quieras: efectivo, transferencia (20% off), débito, crédito o QR.</li>' +
            '</ul>' +
          '</div>' +
        '</div>' +

        (guia ? (
          '<div class="pdp__modal" id="pdp-guia" hidden>' +
            '<div class="pdp__modal-cuerpo" role="dialog" aria-modal="true" aria-label="Guía de talles">' +
              '<button type="button" class="pdp__modal-cerrar" data-cerrar-guia aria-label="Cerrar">&times;</button>' +
              tablaGuia +
            '</div>' +
          '</div>'
        ) : '') +
      '</div>' +

      '<div class="seccion seccion--arena">' +
        '<div class="wrap">' +
          '<div class="cabecera-seccion">' +
            '<p class="ojal">Quizás también te interese</p>' +
            '<h2>Otras prendas de <span class="it">' + esc((cat.nombre || '').toLowerCase()) + '</span></h2>' +
          '</div>' +
          '<div class="grid-prod" id="pdp-relacionados"></div>' +
        '</div>' +
      '</div>';

    var relacionados = (B.productos || []).filter(function (x) { return x.cat === p.cat && x.id !== p.id; });
    if (!relacionados.length) { relacionados = (B.productos || []).filter(function (x) { return x.id !== p.id; }); }
    relacionados = relacionados.slice(0, 8);
    var gridRel = $('#pdp-relacionados');
    gridRel.innerHTML = relacionados.map(tarjetaProducto).join('');

    cargarFotos(cont);
    cargarFotos(gridRel);
    observar(cont);
    observar(gridRel);

    var elegido = { talle: talles.length ? String(talles[0]) : '', color: (p.colores || [])[0] || '' };

    function refrescarValores() {
      var vt = $('[data-valor-talle]', cont); if (vt) { vt.textContent = elegido.talle ? ': ' + elegido.talle : ''; }
      var vc = $('[data-valor-color]', cont); if (vc) { vc.textContent = elegido.color ? ': ' + elegido.color : ''; }
    }
    refrescarValores();

    cont.addEventListener('click', function (ev) {
      var tOp = ev.target.closest ? ev.target.closest('[data-talle]') : null;
      if (tOp) {
        elegido.talle = tOp.getAttribute('data-talle');
        $$('.talle-op', cont).forEach(function (b) { b.classList.toggle('is-activo', b === tOp); });
        refrescarValores();
        return;
      }
      var cOp = ev.target.closest ? ev.target.closest('[data-color]') : null;
      if (cOp) {
        elegido.color = cOp.getAttribute('data-color');
        $$('.color-op', cont).forEach(function (b) { b.classList.toggle('is-activo', b === cOp); });
        refrescarValores();
        return;
      }
      var input = $('[data-cant-valor]', cont);
      if (ev.target.closest('[data-cant-menos]') && input) {
        input.value = Math.max(1, (parseInt(input.value, 10) || 1) - 1);
        return;
      }
      if (ev.target.closest('[data-cant-mas]') && input) {
        input.value = (parseInt(input.value, 10) || 1) + 1;
        return;
      }
      var modal = $('#pdp-guia');
      if (ev.target.closest('[data-abrir-guia]') && modal) { modal.hidden = false; return; }
      if ((ev.target.closest('[data-cerrar-guia]') || ev.target === modal) && modal) { modal.hidden = true; return; }

      if (ev.target.closest('[data-agregar-carrito]') || ev.target.closest('[data-comprar-ahora]')) {
        var esComprar = !!ev.target.closest('[data-comprar-ahora]');
        var cant = parseInt(($('[data-cant-valor]', cont) || {}).value, 10) || 1;
        carritoAgregar(p.id, elegido.talle, elegido.color, cant);
        if (esComprar) {
          window.location.href = 'carrito.html';
        } else {
          var aviso = $('[data-aviso]', cont);
          if (aviso) {
            aviso.hidden = false;
            window.clearTimeout(aviso._t);
            aviso._t = window.setTimeout(function () { aviso.hidden = true; }, 2500);
          }
        }
      }
    });

    document.addEventListener('keydown', function (ev) {
      var modal = $('#pdp-guia');
      if (ev.key === 'Escape' && modal && !modal.hidden) { modal.hidden = true; }
    });
  });

  /* ==========================================================================
     13c) Carrito (carrito.html)
     --------------------------------------------------------------------------
     El envío no lo elige la persona directamente: completa sus datos
     (sobre todo la provincia) y el sitio decide sola la zona, como en
     cualquier tienda de verdad. San Luis siempre sale gratis. Las
     provincias de la Patagonia están marcadas "no disponible" en el
     archivo de datos: para esas, el carrito no arma un pedido — invita
     a escribir por WhatsApp para ver si hay alguna forma de todos modos.
     ========================================================================== */
  var DATOS_ENVIO_KEY = 'pl_datos_envio';

  function datosEnvioLeer() {
    try { return JSON.parse(window.localStorage.getItem(DATOS_ENVIO_KEY) || '{}'); }
    catch (e) { return {}; }
  }

  function datosEnvioGuardar(datos) {
    try { window.localStorage.setItem(DATOS_ENVIO_KEY, JSON.stringify(datos)); } catch (e) {}
  }

  function zonaDeProvincia(nombreProvincia) {
    var lista = (B.envio && B.envio.provincias) || [];
    for (var i = 0; i < lista.length; i++) {
      if (lista[i][0] === nombreProvincia) { return lista[i][1]; }
    }
    return '';
  }

  safe('carrito', function () {
    var cont = $('#carrito');
    if (!cont) { return; }
    var resumen = $('#carrito-resumen');
    var form = $('#datos-envio');
    var chkRetiro = $('#chk-retiro');
    var camposDireccion = $('#campos-direccion');
    var selProvincia = $('#sel-provincia');
    var avisoZona = $('#aviso-zona');
    var btnFinalizar = $('#carrito-finalizar');
    var btnPagar = $('#carrito-pagar');
    var avisoPago = $('#aviso-pago');

    /* Provincias del selector, una sola vez. */
    if (selProvincia && selProvincia.options.length <= 1) {
      var provincias = (B.envio && B.envio.provincias) || [];
      provincias.forEach(function (par) {
        var op = document.createElement('option');
        op.value = par[0];
        op.textContent = par[0];
        selProvincia.appendChild(op);
      });
    }

    /* Datos guardados de una visita anterior, para no tener que
       escribirlos de nuevo si la persona vuelve más tarde a pagar. */
    (function precargar() {
      var datos = datosEnvioLeer();
      if (!form) { return; }
      ['nombre', 'telefono', 'provincia', 'localidad', 'direccion', 'cp'].forEach(function (campo) {
        var el = form.elements[campo];
        if (el && datos[campo]) { el.value = datos[campo]; }
      });
      if (chkRetiro) { chkRetiro.checked = !!datos.retiro; }
    })();

    function zonaActual() {
      if (chkRetiro && chkRetiro.checked) { return { id: 'retiro', nombre: 'Retiro en el local', precio: 0, disponible: true, gratis: true }; }
      var nombreProvincia = selProvincia ? selProvincia.value : '';
      var zid = zonaDeProvincia(nombreProvincia);
      var zonas = (B.envio && B.envio.zonas) || {};
      if (!zid || !zonas[zid]) { return null; }
      var z = zonas[zid];
      return { id: zid, nombre: z.nombre, precio: z.precio, disponible: z.disponible, gratis: !!z.gratis };
    }

    function actualizarCamposObligatorios() {
      var esRetiro = !!(chkRetiro && chkRetiro.checked);
      if (camposDireccion) { camposDireccion.hidden = esRetiro; }
      ['provincia', 'localidad', 'direccion'].forEach(function (campo) {
        var el = form && form.elements[campo];
        if (el) { el.required = !esRetiro; }
      });
    }

    function actualizarResumen() {
      var items = carritoLeer();
      var subtotal = carritoSubtotal(items);
      var zona = zonaActual();
      var gratisDesde = C.envioGratisDesde || Infinity;
      var esGratisPorMonto = subtotal > 0 && subtotal >= gratisDesde;

      if (avisoZona) {
        if (zona && zona.disponible === false) {
          avisoZona.hidden = false;
          avisoZona.textContent = 'Por ahora no hacemos envíos a ' + zona.nombre + '. Escribinos por WhatsApp y vemos cómo coordinarlo.';
        } else {
          avisoZona.hidden = true;
        }
      }

      var envio = 0;
      var envioTexto = '—';
      if (zona && zona.disponible === false) {
        envioTexto = 'No disponible';
        envio = 0;
      } else if (zona && (zona.gratis || esGratisPorMonto)) {
        envioTexto = 'Gratis';
        envio = 0;
      } else if (zona) {
        envio = zona.precio || 0;
        envioTexto = zona.precio > 0 ? pesos(envio) : 'A confirmar';
      }

      $('#carrito-subtotal').textContent = pesos(subtotal);
      $('#carrito-envio').textContent = envioTexto;
      $('#carrito-total').textContent = pesos(subtotal + envio);

      /* A la Patagonia no se le puede mandar el paquete: ahí no tiene
         sentido ni mostrar el botón de pagar, mejor que la única salida
         sea escribir por WhatsApp para ver si hay alguna vuelta. */
      var noDisponible = !!(zona && zona.disponible === false);
      if (btnPagar) { btnPagar.hidden = noDisponible; }
      if (btnFinalizar) {
        btnFinalizar.textContent = noDisponible ? 'Consultar por WhatsApp' : 'O coordinar por WhatsApp';
      }
    }

    function render() {
      var items = carritoLeer();

      if (!items.length) {
        cont.innerHTML =
          '<div class="vacio">' +
            '<img class="vacio__gato" src="assets/img/mascota-gato.webp" alt="" width="700" height="669" decoding="async">' +
            '<h2>Tu carrito está vacío</h2>' +
            '<p class="bajada">Todavía no agregaste ninguna prenda.</p>' +
            '<p style="margin-top:1.2rem"><a class="btn btn--zorro" href="productos.html">Ver el catálogo</a></p>' +
          '</div>';
        if (resumen) { resumen.hidden = true; }
        return;
      }
      if (resumen) { resumen.hidden = false; }

      cont.innerHTML = items.map(function (it, i) {
        var p = productoPorId(it.id);
        if (!p) { return ''; }
        var sub = p.precio * it.cantidad;
        return (
          '<article class="linea-carrito" data-indice="' + i + '">' +
            '<a class="linea-carrito__foto ph ph--4x5" href="producto.html?id=' + esc(p.id) + '"' +
              ' style="--tint:' + (TINTES[p.cat] || 'var(--t-tinta)') + '" data-img="' + esc(p.img) + '" data-alt="' + esc(p.nombre) + '">' +
              '<span class="ph__tag">FOTO</span><span class="ph__nombre">' + esc(p.nombre) + '</span>' +
              '<span class="ph__medida">1000 × 1250 px</span><code class="ph__ruta">' + esc(p.img) + '</code>' +
            '</a>' +
            '<div class="linea-carrito__info">' +
              '<a class="linea-carrito__nombre" href="producto.html?id=' + esc(p.id) + '">' + esc(p.nombre) + '</a>' +
              '<p class="linea-carrito__detalle">Talle ' + esc(it.talle || '-') + (it.color ? ' · ' + esc(it.color) : '') + '</p>' +
              '<p class="linea-carrito__precio">' + pesos(p.precio) + ' c/u</p>' +
              '<div class="cantidad-stepper cantidad-stepper--chica">' +
                '<button type="button" data-cant-menos aria-label="Restar uno">−</button>' +
                '<input type="text" inputmode="numeric" value="' + it.cantidad + '" data-cant-valor readonly aria-label="Cantidad">' +
                '<button type="button" data-cant-mas aria-label="Sumar uno">+</button>' +
              '</div>' +
              '<button type="button" class="linea-carrito__quitar" data-quitar>Quitar</button>' +
            '</div>' +
            '<p class="linea-carrito__subtotal">' + pesos(sub) + '</p>' +
          '</article>'
        );
      }).join('');

      cargarFotos(cont);
      actualizarResumen();
    }

    render();
    actualizarCamposObligatorios();
    document.addEventListener('carrito:cambio', render);

    cont.addEventListener('click', function (ev) {
      var art = ev.target.closest ? ev.target.closest('.linea-carrito') : null;
      if (!art) { return; }
      var i = parseInt(art.getAttribute('data-indice'), 10);
      var items = carritoLeer();
      if (ev.target.closest('[data-quitar]')) { carritoQuitar(i); return; }
      if (ev.target.closest('[data-cant-menos]')) { carritoActualizarCantidad(i, (items[i].cantidad || 1) - 1); return; }
      if (ev.target.closest('[data-cant-mas]')) { carritoActualizarCantidad(i, (items[i].cantidad || 1) + 1); return; }
    });

    if (chkRetiro) {
      chkRetiro.addEventListener('change', function () {
        actualizarCamposObligatorios();
        actualizarResumen();
      });
    }
    if (form) {
      form.addEventListener('change', actualizarResumen);
      form.addEventListener('input', function () {
        var datos = {};
        ['nombre', 'telefono', 'provincia', 'localidad', 'direccion', 'cp'].forEach(function (campo) {
          datos[campo] = form.elements[campo] ? form.elements[campo].value : '';
        });
        datos.retiro = !!(chkRetiro && chkRetiro.checked);
        datosEnvioGuardar(datos);
      });
    }

    var btnVaciar = $('#carrito-vaciar');
    if (btnVaciar) {
      btnVaciar.addEventListener('click', function () {
        if (window.confirm('¿Vaciar el carrito?')) { carritoVaciar(); }
      });
    }

    /* Junta los datos del formulario una sola vez: la usan tanto "Pagar
       con Mercado Pago" como "O coordinar por WhatsApp", así no hay dos
       copias del mismo código leyendo los mismos campos. */
    function leerFormulario() {
      var esRetiro = !!(chkRetiro && chkRetiro.checked);
      return {
        esRetiro: esRetiro,
        zona: zonaActual(),
        datos: form ? {
          nombre: form.elements.nombre.value,
          telefono: form.elements.telefono.value,
          provincia: form.elements.provincia.value,
          localidad: form.elements.localidad.value,
          direccion: form.elements.direccion.value,
          cp: form.elements.cp.value
        } : {}
      };
    }

    /* "Pagar con Mercado Pago" — le pide a la función del servidor
       (api/crear-preferencia.js) que arme el link de pago y manda ahí al
       comprador. Esa función todavía no está desplegada en ningún lado
       mientras el sitio corra sólo en esta compu (no hay "servidor" acá
       al lado, es sólo el visor de archivos): por eso, si el pedido
       falla porque no hay conexión, se avisa con un mensaje claro en vez
       de quedarse sin hacer nada. */
    if (btnPagar) {
      btnPagar.addEventListener('click', function () {
        var items = carritoLeer();
        if (!items.length) { return; }
        if (form && !form.reportValidity()) { return; }

        var f = leerFormulario();
        var gratisDesde = C.envioGratisDesde || Infinity;
        var subtotal = carritoSubtotal(items);
        var esGratisPorMonto = subtotal > 0 && subtotal >= gratisDesde;
        var envioFinal = (f.esRetiro || (f.zona && f.zona.gratis) || esGratisPorMonto) ? 0 : ((f.zona && f.zona.precio) || 0);

        var payload = {
          items: items.map(function (it) {
            var p = productoPorId(it.id);
            return p ? {
              title: p.nombre + ' (talle ' + (it.talle || '-') + (it.color ? ', ' + it.color : '') + ')',
              quantity: it.cantidad,
              unit_price: p.precio
            } : null;
          }).filter(Boolean),
          envio: {
            nombre: f.esRetiro ? 'Retiro en el local' : (f.zona ? f.zona.nombre : ''),
            precio: envioFinal,
            direccion: f.datos.direccion,
            localidad: f.datos.localidad,
            provincia: f.datos.provincia,
            cp: f.datos.cp
          },
          comprador: { nombre: f.datos.nombre, telefono: f.datos.telefono }
        };

        if (avisoPago) { avisoPago.hidden = true; }
        btnPagar.disabled = true;
        var textoOriginal = btnPagar.textContent;
        btnPagar.textContent = 'Un momento…';

        fetch('/api/crear-preferencia', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
          .then(function (r) { return r.json(); })
          .then(function (data) {
            /* Mercado Pago siempre manda dos links: "init_point" (el de
               verdad) y "sandbox_init_point" (uno de prueba, que existe
               siempre, incluso con las credenciales reales). Usar el de
               verdad es lo que corresponde acá — el carrito no tiene
               ningún modo de prueba propio. */
            if (data && data.init_point) {
              window.location.href = data.init_point;
            } else {
              throw new Error('sin init_point');
            }
          })
          .catch(function () {
            btnPagar.disabled = false;
            btnPagar.textContent = textoOriginal;
            if (avisoPago) {
              avisoPago.hidden = false;
              avisoPago.textContent = 'No pudimos conectar con Mercado Pago. Probá de nuevo en un rato, o usá "coordinar por WhatsApp" acá abajo.';
            }
          });
      });
    }

    /* Todavía no hay cobro online (eso es la próxima etapa, con Mercado
       Pago): por ahora "Finalizar pedido" arma un mensaje de WhatsApp con
       el pedido y los datos de envío completos, para que no falte nada
       al coordinar el pago. Si la zona no está disponible, el botón ya
       dice "Consultar por WhatsApp" (ver actualizarResumen) y este mismo
       mensaje sirve para eso: preguntar si hay alguna forma de todos
       modos. */
    if (btnFinalizar) {
      btnFinalizar.addEventListener('click', function () {
        var items = carritoLeer();
        if (!items.length) { return; }
        if (form && !form.reportValidity()) { return; }

        var f = leerFormulario();
        var datos = f.datos;
        var zona = f.zona;

        var lineas = items.map(function (it) {
          var p = productoPorId(it.id);
          if (!p) { return ''; }
          return '- ' + p.nombre + ' (talle ' + (it.talle || '-') + (it.color ? ', ' + it.color : '') + ') x' + it.cantidad + ': ' + pesos(p.precio * it.cantidad);
        }).filter(Boolean).join('\n');
        var subtotal = carritoSubtotal(items);

        var textoEnvio = f.esRetiro
          ? 'Paso a retirarlo por el local.'
          : ('Envío a: ' + datos.direccion + ', ' + datos.localidad + ', ' + datos.provincia + (datos.cp ? ' (CP ' + datos.cp + ')' : ''));

        var texto = 'Hola! Soy ' + (datos.nombre || '') + ' (' + (datos.telefono || '') + '). Quiero comprar:\n' +
          lineas + '\n\nSubtotal: ' + pesos(subtotal) + '\n' + textoEnvio +
          (zona && zona.disponible === false
            ? '\n\nVi que a ' + zona.nombre + ' no hacen envíos por la web todavía: ¿hay alguna forma de coordinarlo igual?'
            : '\n\n¿Cómo hago para pagar?');

        window.open(wa(texto), '_blank', 'noopener');
      });
    }
  });

  /* ==========================================================================
     13d) Contador del carrito en el menú (todas las páginas)
     ========================================================================== */
  safe('badge carrito', function () {
    function actualizar() {
      var n = carritoContarItems();
      $$('.nav__carrito-badge').forEach(function (b) {
        b.textContent = String(n);
        b.hidden = n === 0;
      });
    }
    actualizar();
    document.addEventListener('carrito:cambio', actualizar);
    window.addEventListener('storage', function (ev) { if (ev.key === CARRITO_KEY) { actualizar(); } });
  });

  /* ==========================================================================
     14) Navegación: sólida al scrollear + menú móvil
     ========================================================================== */
  safe('nav', function () {
    var nav = $('#nav');
    if (!nav) { return; }

    function alScrollear() {
      if (window.pageYOffset > 12) { nav.classList.add('is-solid'); }
      else if (!nav.classList.contains('is-open')) { nav.classList.remove('is-solid'); }
    }
    window.addEventListener('scroll', alScrollear, { passive: true });
    alScrollear();

    var hamb = $('#hamb');
    var menu = $('#menu');
    if (!hamb || !menu) { return; }

    function cerrar() {
      nav.classList.remove('is-open');
      hamb.setAttribute('aria-expanded', 'false');
      alScrollear();
    }

    hamb.addEventListener('click', function () {
      var abierto = nav.classList.toggle('is-open');
      hamb.setAttribute('aria-expanded', abierto ? 'true' : 'false');
      if (abierto) { nav.classList.add('is-solid'); } else { alScrollear(); }
    });

    /* El menú se cierra al tocar cualquier link */
    menu.addEventListener('click', function (ev) {
      if (ev.target.closest && ev.target.closest('a')) { cerrar(); }
    });

    document.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape' && nav.classList.contains('is-open')) { cerrar(); hamb.focus(); }
    });
  });

  /* ==========================================================================
     15) Salto del logo del hero
     El logo "salta" al pasar el mouse. Antes era puro CSS con ":hover",
     pero si el mouse se iba antes de que termine la animación (0,7s), se
     cortaba de golpe a mitad de camino. Acá se agrega una clase al
     entrar el mouse y se saca recién cuando la animación termina sola
     ("animationend"), así el salto siempre se completa aunque el mouse
     ya esté en otro lado. Si el mouse vuelve a entrar mientras todavía
     está saltando, no hace nada nuevo: deja que termine el salto en
     curso primero.
     ========================================================================== */
  safe('salto logo', function () {
    if (!window.matchMedia || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) { return; }
    var marca = $('.hero__marca');
    var img = marca && $('img', marca);
    if (!marca || !img) { return; }

    marca.addEventListener('mouseenter', function () {
      if (marca.classList.contains('is-saltando')) { return; }
      marca.classList.add('is-saltando');
    });
    img.addEventListener('animationend', function () {
      marca.classList.remove('is-saltando');
    });
  });

  /* ==========================================================================
     16) Revelado al scrollear + red de seguridad de 6 segundos
     ========================================================================== */
  var observador = null;
  function observar(ctx) {
    if (!observador) { return; }
    $$('.reveal', ctx || document).forEach(function (el) {
      if (!el.classList.contains('is-in')) { observador.observe(el); }
    });
  }

  safe('reveal', function () {
    function revelarTodo() {
      $$('.reveal').forEach(function (el) { el.classList.add('is-in'); });
    }

    if (!('IntersectionObserver' in window)) { revelarTodo(); return; }

    observador = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('is-in');
          observador.unobserve(e.target);
        }
      });
    }, { threshold: 0.05, rootMargin: '0px 0px -40px 0px' });

    observar(document);

    /* Si algo quedó invisible por cualquier motivo, a los 6 segundos se muestra. */
    window.setTimeout(revelarTodo, 6000);
  });

  /* ==========================================================================
     17) Aviso: falta cargar el WhatsApp real
     Sólo aparece en localhost o abriendo el archivo con doble clic.
     ========================================================================== */
  safe('aviso whatsapp', function () {
    var esLocal = location.protocol === 'file:' ||
      /^(localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\])$/.test(location.hostname);
    if (!esLocal) { return; }
    if (B.whatsapp !== B.whatsappPlaceholder) { return; }
    var d = document.createElement('div');
    d.className = 'aviso-wa';
    d.setAttribute('role', 'status');
    d.innerHTML = 'Falta cargar el WhatsApp real en <code>lib/manifest.js</code> ' +
      '(ahora está el número de ejemplo). Este aviso no se ve una vez publicado el sitio.';
    document.body.appendChild(d);
  });

  /* ==========================================================================
     18) Año del footer
     ========================================================================== */
  safe('anio', function () {
    $$('[data-anio]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
  });

  /* ==========================================================================
     19) Última pasada: cargar las fotos de todo lo que quedó en la página
     ========================================================================== */
  safe('fotos', function () { cargarFotos(document); });

})();
