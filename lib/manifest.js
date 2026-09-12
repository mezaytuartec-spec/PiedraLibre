/* ============================================================================
   PIEDRA LIBRE · LOS MOLLES — ARCHIVO DE DATOS
   ----------------------------------------------------------------------------
   ESTE ES EL ÚNICO ARCHIVO QUE HAY QUE TOCAR PARA ACTUALIZAR EL SITIO.
   No hace falta saber programar. Cambiás el texto entre comillas y listo.

   Reglas simples:
     · Todo lo que va entre comillas 'así' es texto que podés cambiar.
     · No borres las comas del final de cada línea.
     · Los precios se escriben SIN puntos ni signo peso: 39900  (no $39.900)
     · Después de guardar, refrescá la página con Ctrl+F5.
   ============================================================================ */

(function () {
  'use strict';

  /* ==========================================================================
     1) WHATSAPP  <<< LO PRIMERO QUE HAY QUE CAMBIAR
     --------------------------------------------------------------------------
     FORMATO DEL NÚMERO (sin espacios, sin +, sin guiones, sin paréntesis):

         54  +  9  +  código de área SIN el 0  +  número SIN el 15

     Ejemplo:
         Teléfono como lo marcás en el celular:  0 2656  15  432100
         Cómo se escribe acá:                    54 9 2656 432100
         Queda:                                  '5492656432100'

     Mientras diga 5492656000000 el sitio te va a avisar con una franja roja
     abajo. Esa franja SOLO se ve abriendo el archivo en tu compu: nunca la
     ve un cliente cuando el sitio está publicado.

     Ya puse el número real, tal como está en el botón de WhatsApp de tu
     tienda de Tiendanube (sin el 9 — así es como lo tenés cargado ahí y
     funciona, así que lo dejé exactamente igual para no romper nada).
     Si en algún momento notás que no te llegan los mensajes, probá
     agregando el 9: '5492664371845'.
     ========================================================================== */
  var WHATSAPP = '542664371845';

  /* ==========================================================================
     2) DATOS DEL NEGOCIO
     ========================================================================== */
  var MARCA = {
    nombre:        'Piedra Libre',
    bajada:        'Los Molles',
    bio:           'Ropa infantil de algodón. Diseñamos, cortamos, estampamos y cosemos en Los Molles, San Luis.',
    mail:          'piedralibremerlo@gmail.com',
    instagram:     'piedralibrelosmolles',
    instagramUrl:  'https://www.instagram.com/piedralibrelosmolles/',
    facebookUrl:   'https://www.facebook.com/piedralibre.merlo',
    tiendanube:    '',   /* <- pegá el link de tu tienda de Tiendanube si querés mostrarlo */
    sitio:         'https://piedralibrelosmolles.com.ar',    /* <- el dominio final del sitio */

    direccion:     'Don Julio 150',
    localidad:     'Los Molles',
    provincia:     'San Luis',
    pais:          'Argentina',
    cp:            'D5883',
    plusCode:      'HX6W+9W Los Molles, San Luis',

    /* Coordenadas APROXIMADAS de Los Molles. Para el punto exacto: abrí Google
       Maps, botón derecho sobre el local, y copiá los dos números que aparecen. */
    lat:           -32.3167,
    lng:           -65.0000,

    horarios: [
      { dias: 'Lunes a sábado', hora: '10:00 – 13:00 · 17:00 – 21:00' },
      { dias: 'Domingo',        hora: '10:00 – 13:00' }
    ],
    /* Los mismos horarios en el formato que entiende Google.
       Si cambian los de arriba, cambiá también estos. */
    horariosSchema: ['Mo-Sa 10:00-13:00', 'Mo-Sa 17:00-21:00', 'Su 10:00-13:00'],

    pagosEnLocal: ['Efectivo', 'Débito', 'Crédito', 'Transferencia', 'QR / Mercado Pago'],

    google: {
      rating: 5.0,
      reviews: 14,
      /* Tu ficha en Google Maps: buscá el local, tocá Compartir y pegá el link acá. */
      url: 'https://www.google.com/maps/search/?api=1&query=Piedra+Libre+Los+Molles+Don+Julio+150'
    }
  };

  /* ==========================================================================
     3) CONDICIONES COMERCIALES
     ========================================================================== */
  var CONDICIONES = {
    cuotas:            3,
    descTransferencia: 20,        /* porcentaje */
    envioGratisDesde:  69000,     /* pesos — igual al de la campaña activa en Tiendanube */
    retiroLocal:       true
  };

  /* ==========================================================================
     3b) ENVÍOS
     --------------------------------------------------------------------------
     No es un precio "por dirección" (no se calcula por peso ni código
     postal): es un precio fijo por ZONA, y la zona sale sola de la
     provincia que la persona elige al armar el pedido — así no hace
     falta que adivine ella misma en qué zona está.

     Los precios "Regional" y "Nacional" son los que pasaste (tarifa
     "hasta 1kg", que es más que de sobra para lo que pesa un pedido de
     ropa de chicos — no hacía falta el dato del peso). "Regional" es
     para las provincias más cerca de acá (Cuyo); "Nacional", para el
     resto del país que sí se puede mandar. San Luis siempre es gratis
     (es donde está el taller). Las provincias de la Patagonia quedan
     marcadas "disponible: false": ahí no se puede mandar el paquete por
     los medios que usamos, así que el carrito no deja avanzar con el
     envío para esas provincias y en cambio invita a escribir por
     WhatsApp para ver si hay alguna alternativa.

     OJO: "Regional" hoy incluye sólo las provincias vecinas (Córdoba,
     Mendoza, San Juan, La Rioja). Si tu transporte define "regional" de
     otra forma, movés la provincia de una lista a otra acá abajo, nada
     más — no hay que tocar ningún otro archivo.
     ========================================================================== */
  var ENVIO = {
    zonas: {
      'san-luis':  { nombre: 'San Luis (zona local)', precio: 0,     disponible: true, gratis: true },
      'regional':  { nombre: 'Regional (Cuyo)',       precio: 19500, disponible: true },
      'nacional':  { nombre: 'Resto del país',        precio: 26400, disponible: true },
      'patagonia': { nombre: 'Patagonia',             precio: null,  disponible: false }
    },
    /* [provincia, zona] — el orden es el que se muestra en el selector. */
    provincias: [
      ['San Luis', 'san-luis'],
      ['Córdoba', 'regional'],
      ['Mendoza', 'regional'],
      ['San Juan', 'regional'],
      ['La Rioja', 'regional'],
      ['CABA', 'nacional'],
      ['Buenos Aires', 'nacional'],
      ['Santa Fe', 'nacional'],
      ['Entre Ríos', 'nacional'],
      ['Catamarca', 'nacional'],
      ['Tucumán', 'nacional'],
      ['Santiago del Estero', 'nacional'],
      ['Salta', 'nacional'],
      ['Jujuy', 'nacional'],
      ['Formosa', 'nacional'],
      ['Chaco', 'nacional'],
      ['Corrientes', 'nacional'],
      ['Misiones', 'nacional'],
      ['La Pampa', 'nacional'],
      ['Neuquén', 'patagonia'],
      ['Río Negro', 'patagonia'],
      ['Chubut', 'patagonia'],
      ['Santa Cruz', 'patagonia'],
      ['Tierra del Fuego', 'patagonia']
    ]
  };

  /* ==========================================================================
     4) CATEGORÍAS Y TALLES
     ========================================================================== */
  var CATEGORIAS = [
    {
      id: 'bebes',
      nombre: 'Bebés',
      color: '#EFA92B',        /* bloques: sombras, puntos */
      colorTexto: '#8A5A00',   /* texto chico: version que cumple contraste AA */
      talles: '01 · 02 · 03 · 04',
      texto: 'Algodón suave, broches abajo y nada que moleste. Para los primeros meses.',
      img: 'assets/img/cat-bebes.webp',
      imgAlt: 'Bebé con la remera de colibríes de Piedra Libre',
      subs: [
        { id: 'bodys',      nombre: 'Bodys' },
        { id: 'enteritos',  nombre: 'Enteritos' },
        { id: 'pantalones', nombre: 'Pantalones' },
        { id: 'baberos',    nombre: 'Baberos' }
      ]
    },
    {
      id: 'ninas',
      nombre: 'Niñas',
      color: '#D13F76',        /* bloques: sombras, puntos */
      colorTexto: '#C0326B',   /* texto chico: version que cumple contraste AA */
      talles: 'Del 2 al 12',
      texto: 'Vestidos y chalecos con apliques cosidos uno por uno. Para jugar en serio.',
      img: 'assets/img/cat-ninas.webp?v=2',
      imgAlt: 'Nena con un buzo violeta con estampa de llama, de Piedra Libre',
      subs: [
        { id: 'remeras',  nombre: 'Remeras' },
        { id: 'vestidos', nombre: 'Vestidos' },
        { id: 'short',    nombre: 'Short' },
        { id: 'chalecos', nombre: 'Chalecos' }
      ]
    },
    {
      id: 'ninos',
      nombre: 'Niños',
      color: '#4F8A3D',        /* bloques: sombras, puntos */
      colorTexto: '#35662A',   /* texto chico: version que cumple contraste AA */
      talles: 'Del 2 al 12',
      texto: 'Estampas de la fauna de las sierras. Algodón que aguanta el uso diario.',
      img: 'assets/img/cat-ninos.webp',
      imgAlt: 'Nene con un chaleco con capucha y estampa de sachacabra, de Piedra Libre',
      subs: [
        { id: 'remeras',  nombre: 'Remeras' },
        { id: 'short',    nombre: 'Short' },
        { id: 'chalecos', nombre: 'Chalecos' }
      ]
    },
    {
      id: 'discontinuos',
      nombre: 'Discontinuos',
      color: '#7A4A9E',        /* bloques: sombras, puntos */
      colorTexto: '#7A4A9E',   /* texto chico: version que cumple contraste AA */
      talles: 'Talles sueltos',
      texto: 'Temporadas pasadas a precio de liquidación. Lo que queda, queda.',
      img: 'assets/img/cat-discontinuos.webp',
      imgAlt: 'Prendas de temporadas pasadas en liquidación',
      subs: [
        { id: 'liquidacion', nombre: 'Liquidación' }
      ]
    }
  ];

  /* ==========================================================================
     5) COLORES DEL CATÁLOGO
     Si sumás un color nuevo, agregalo acá con su código de color.
     ========================================================================== */
  var COLORES = {
    'Verde manzana': '#7CB342',
    'Lime green':    '#B8D430',
    'Naranja':       '#E05B26',
    'Rojo':          '#D2372F',
    'Coral':         '#F2705A',
    'Fucsia sound':  '#D13F76',
    'Violeta':       '#7A4A9E',
    'Azul francia':  '#2E63A8',
    'Azul aéro':     '#3FA7D6',
    'Azul celeste':  '#8ECAE6',
    'Gris melange':  '#B0AAA0',
    'Gris':          '#9B9490',
    'orquidea':      '#C77DC0',
    'Tricolor':      'tricolor'
  };

  /* ==========================================================================
     5b) GUÍA DE TALLES (medidas reales de cada prenda, en cm)
     --------------------------------------------------------------------------
     Sacado de la tabla de medidas de la marca. Cada producto usa una de estas
     guías a través de su campo "guiaTalles" (ver más abajo en 6, PRODUCTOS).
     "col" son los nombres de columna y "filas" son los datos: el talle y
     después una medida por columna, en el mismo orden que "col".
     ========================================================================== */
  var TALLES = {
    'remera-nino': {
      titulo: 'Remeras ranglan niño / unisex',
      col: ['Talle', 'Ancho', 'Largo'],
      filas: [[2, 30, 36], [4, 32, 40], [6, 34, 45], [8, 39, 52], [12, 43, 61]],
      notas: ['Ancho: medida en cm. tomada en el frente de la prenda.', 'Largo: corresponde a la medida desde hombro a ruedo.']
    },
    'chaleco-nino-unisex': {
      titulo: 'Chalecos niño / unisex',
      col: ['Talle', 'Ancho', 'Largo'],
      filas: [[2, 33, 36], [4, 35, 38], [6, 38, 42], [8, 40, 47], [12, 45, 55]],
      notas: ['Ancho: medida en cm. tomada en el frente de la prenda.', 'Largo: corresponde a la medida desde hombro a ruedo.']
    },
    'short-nino': {
      titulo: 'Short niño',
      col: ['Talle', 'Ancho', 'Largo'],
      filas: [[2, 44, 26], [4, 46, 29], [6, 48, 34], [8, 50, 36], [10, 52, 39]],
      notas: ['Ancho: medida del elástico en reposo (sin estirar) en la cintura.', 'Largo: desde la cintura hasta el ruedo por el lateral.']
    },
    'pantalon-nino': {
      titulo: 'Pantalón largo',
      col: ['Talle', 'Cintura', 'Cadera', 'Largo'],
      filas: [[2, 44, 74, 46], [4, 46, 74, 50], [6, 48, 82, 54], [8, 50, 86, 60], [10, 52, 88, 66]],
      notas: [
        'Cintura: medida del elástico en reposo (sin estirar).',
        'Cadera: ancho total, se mide el frente de la prenda y se multiplica x2.',
        'Largo: total, medido desde el lateral.'
      ]
    },
    'remera-nena': {
      titulo: 'Remeras nena',
      col: ['Talle', 'Ancho', 'Largo'],
      filas: [[2, 29, 34], [4, 32, 38], [6, 34, 43], [8, 36, 48], [10, 39, 50], [12, 41, 54]],
      notas: ['Ancho: medida en cm. tomada en el frente de la prenda.', 'Largo: corresponde a la medida desde hombro a ruedo.']
    },
    'vestido-tricolor': {
      titulo: 'Vestido Tricolor',
      col: ['Talle', 'Ancho', 'Largo'],
      filas: [[2, 27, 49], [4, 29, 54], [6, 30, 59], [8, 31, 65], [10, 33, 72], [12, 35, 83]],
      notas: ['Ancho: medida en cm. tomada en el frente de la prenda.', 'Largo: desde hombro a ruedo, tomado en el frente de la prenda.']
    },
    'vestido-flor': {
      titulo: 'Vestido Flor',
      col: ['Talle', 'Ancho', 'Largo'],
      filas: [[2, 30, 50], [4, 32, 53], [6, 34, 57], [8, 36, 63], [10, 40, 65], [12, 45, 70]],
      notas: ['Ancho: medida en cm. tomada en el frente de la prenda.', 'Largo: desde hombro a ruedo, tomado en el frente de la prenda.']
    },
    'vestido-chinita': {
      titulo: 'Vestido Chinita',
      col: ['Talle', 'Ancho', 'Largo'],
      filas: [[6, 52, 60], [8, 54, 65], [10, 56, 70], [12, 60, 75]],
      notas: ['Ancho: medida del elástico en reposo (sin estirar) en la cintura.', 'Largo: desde hombro a ruedo, tomado en el frente de la prenda.', 'No se hace en talles 2 y 4.']
    },
    'chaleco-nino-nena': {
      titulo: 'Chalecos niño / nena',
      col: ['Talle', 'Ancho', 'Largo'],
      filas: [[2, 33, 36], [4, 35, 40], [6, 38, 45], [8, 40, 50], [10, 42, 55], [12, 45, 59]],
      notas: ['Ancho: medida en cm. tomada en el frente de la prenda.', 'Largo: desde hombro a ruedo, tomado en el frente de la prenda.']
    },
    'short-con-falda': {
      titulo: 'Short con falda',
      col: ['Talle', 'Ancho', 'Largo'],
      filas: [[2, 44, 20], [4, 46, 22], [6, 48, 26], [8, 50, 28], [10, 52, 32]],
      notas: ['Ancho: medida del elástico en reposo (sin estirar) en la cintura.', 'Largo: desde la cintura hasta el ruedo por el lateral.']
    },
    'body-bebe': {
      titulo: 'Body',
      col: ['Talle', 'Ancho', 'Largo tiro'],
      filas: [[1, 22, 36], [2, 24, 39], [3, 26, 42], [4, 28, 43]],
      notas: ['Ancho: medida en cm. tomada en el frente de la prenda.', 'Largo: desde el hombro hasta el tiro, con el body cerrado.']
    },
    'enterito-bebe': {
      titulo: 'Enterito',
      col: ['Talle', 'Ancho', 'Largo tiro'],
      filas: [[1, 25, '35+5'], [2, 27, '37+5'], [3, 29, '41+5'], [4, 32, '43+5']],
      notas: ['Ancho: medida en cm. tomada en el frente de la prenda.', 'Largo: desde el hombro hasta el tiro; las tiras se pueden extender 5 cm más.']
    },
    'babero': {
      titulo: 'Babero',
      col: ['Talle', 'Ancho', 'Largo', 'Contorno cuello'],
      filas: [['Único', 21, 14, 33]],
      notas: ['Ancho: en su parte más ancha.', 'Largo: desde la base del escote hasta la punta.']
    }
  };

  /* ==========================================================================
     6) PRODUCTOS
     --------------------------------------------------------------------------
     Para AGREGAR una prenda: copiá un renglón entero { ... }, pegalo abajo y
     cambiale los datos. Para SACARLA: borrá el renglón completo con su coma.

     Qué significa cada campo:
       id          nombre corto sin espacios ni acentos (se usa para el link)
       nombre      como se muestra en la web
       cat         bebes | ninas | ninos | discontinuos
       sub         tiene que coincidir con un "sub" de la categoría (punto 4)
       talles      texto libre
       colores     los que tengas en stock, escritos igual que en la lista del punto 5
       precio      número sin puntos ni signo peso
       precioAntes solo para liquidación; poné 0 si no aplica
       img         nombre del archivo de foto. Dejá la foto en assets/img/ con
                   EXACTAMENTE ese nombre y aparece sola, sin tocar código.
       destacado   true la muestra en la home (conviene tener 6 en true)

     ESTE CATÁLOGO ES EL REAL: se copió de la tienda de Tiendanube el 2026-09-11
     (piedralibre45.mitiendanube.com/productos/), con sus precios, colores y
     talles tal cual estaban publicados ese día. Las fotos son las mismas que
     usan ahí, ya están en assets/img/.

     Dos precios venían con un error de tipeo evidente en la tienda de origen
     (un short a "$21" y un chaleco a "$2"). Se corrigieron acá al precio de
     una prenda equivalente; quedó una nota en cada línea. Dos productos sin
     categoría asignada todavía en la tienda de origen ("Chaleco Guanaquita"
     y "Chaleco Mara") no se copiaron: agregalos vos cuando sepan en qué
     categoría van.
     ========================================================================== */
  var PRODUCTOS = [

    /* ------------------------------ BEBÉS ------------------------------ */
    { id:'body-sapo',                 nombre:'Body Sapo',                  cat:'bebes', sub:'bodys',      talles:'01 al 04', colores:['Gris melange'],  precio:15900, precioAntes:0, img:'assets/img/body-sapo.webp',                 destacado:true,  guiaTalles:'body-bebe' },
    { id:'body-zorrito',              nombre:'Body Zorrito',               cat:'bebes', sub:'bodys',      talles:'01 al 04', colores:['Gris melange'],  precio:15900, precioAntes:0, img:'assets/img/body-zorrito.webp',              destacado:false, guiaTalles:'body-bebe' },
    { id:'enterito',                  nombre:'Enterito',                   cat:'bebes', sub:'enteritos',  talles:'01 al 04', colores:['Gris'],          precio:18600, precioAntes:0, img:'assets/img/enterito.webp',                  destacado:false, guiaTalles:'enterito-bebe' },
    { id:'pantalon-de-frisa-azul',    nombre:'Pantalón de frisa azul',     cat:'bebes', sub:'pantalones', talles:'2 al 10',  colores:['Azul francia'],  precio:24900, precioAntes:0, img:'assets/img/pantalon-de-frisa-azul.webp',    destacado:true,  guiaTalles:'pantalon-nino' },
    { id:'pantalon-de-frisa-gris',    nombre:'Pantalón de frisa gris melange', cat:'bebes', sub:'pantalones', talles:'2 al 10', colores:['Gris melange'], precio:24900, precioAntes:0, img:'assets/img/pantalon-de-frisa-gris-melange.webp', destacado:false, guiaTalles:'pantalon-nino' },
    { id:'baberos',                   nombre:'Baberos',                    cat:'bebes', sub:'baberos',    talles:'Único',    colores:['Zorro gris','Tortuga'], precio:7900, precioAntes:0, img:'assets/img/baberos.webp',              destacado:false, guiaTalles:'babero' },

    /* ------------------------------ NIÑAS ------------------------------ */
    { id:'vestido-chinita',    nombre:'Vestido Chinita',      cat:'ninas', sub:'vestidos', talles:'6 al 12',  colores:['Fucsia sound'], precio:18600, precioAntes:0, img:'assets/img/vestido-chinita.webp',  destacado:true,  guiaTalles:'vestido-chinita' },
    { id:'vestido-tricolor',   nombre:'Vestido Tricolor',     cat:'ninas', sub:'vestidos', talles:'2 al 12',  colores:['Tricolor'],     precio:18600, precioAntes:0, img:'assets/img/vestido-tricolor.webp', destacado:false, guiaTalles:'vestido-tricolor' },
    { id:'vestido-flor',       nombre:'Vestido Flor',         cat:'ninas', sub:'vestidos', talles:'2 al 12',  colores:['Lime green'],   precio:18600, precioAntes:0, img:'assets/img/vestido-flor.webp',     destacado:false, guiaTalles:'vestido-flor' },
    { id:'short-con-falda',    nombre:'Short con falda',      cat:'ninas', sub:'short',    talles:'2 al 10',  colores:['Azul aéro'],    precio:18600, precioAntes:0, img:'assets/img/short-con-falda.webp',  destacado:true,  guiaTalles:'short-con-falda' },
    { id:'remera-torre',       nombre:'Remera Torre',         cat:'ninas', sub:'remeras',  talles:'2 al 12',  colores:['Rojo'],         precio:15900, precioAntes:0, img:'assets/img/remera-torre.webp',     destacado:false, guiaTalles:'remera-nena' },
    { id:'remera-llama',       nombre:'Remera Llama',         cat:'ninas', sub:'remeras',  talles:'2 al 12',  colores:['Violeta'],      precio:15900, precioAntes:0, img:'assets/img/remera-llama.webp',     destacado:false, guiaTalles:'remera-nena' },
    { id:'remera-sachacabra',  nombre:'Remera Sachacabra',    cat:'ninas', sub:'remeras',  talles:'2 al 12',  colores:['Lime green'],   precio:15900, precioAntes:0, img:'assets/img/remera-sachacabra.webp',destacado:false, guiaTalles:'remera-nena' },
    { id:'chaleco-zorro',      nombre:'Chaleco Zorro',        cat:'ninas', sub:'chalecos', talles:'2 al 12',  colores:['Azul celeste'], precio:24900, precioAntes:0, img:'assets/img/chaleco-zorro.webp',    destacado:false, guiaTalles:'chaleco-nino-nena' },

    /* ------------------------------ NIÑOS ------------------------------ */
    { id:'chaleco-sierras',        nombre:'Chaleco Sierras',        cat:'ninos', sub:'chalecos', talles:'8 al 12',  colores:['Gris'],          precio:20920, precioAntes:0, img:'assets/img/chaleco-sierras.webp',        destacado:true,  guiaTalles:'chaleco-nino-unisex' },
    { id:'chaleco-condor-andino',  nombre:'Chaleco Cóndor Andino',  cat:'ninos', sub:'chalecos', talles:'2 al 12',  colores:['Azul celeste'],  precio:20920, precioAntes:0, img:'assets/img/chaleco-condor-andino.webp',  destacado:false, guiaTalles:'chaleco-nino-unisex' },
    { id:'chaleco-yaguarundi',     nombre:'Chaleco Yaguarundí',     cat:'ninos', sub:'chalecos', talles:'2 al 12',  colores:['orquidea'],      precio:24900, precioAntes:0, img:'assets/img/chaleco-yaguarundi.webp',     destacado:false, guiaTalles:'chaleco-nino-unisex' },
    { id:'chaleco-pecari',         nombre:'Chaleco Pecarí de collar', cat:'ninos', sub:'chalecos', talles:'2 al 8', colores:['Gris melange'],  precio:24900, precioAntes:0, img:'assets/img/chaleco-pecari-de-collar.webp', destacado:false, guiaTalles:'chaleco-nino-unisex' },
    { id:'short-con-estampa',      nombre:'Short con estampa',      cat:'ninos', sub:'short',    talles:'2 al 10',  colores:['Azul francia'],  precio:18600, precioAntes:0, img:'assets/img/short-con-estampa.webp',      destacado:false, guiaTalles:'short-nino' },
    { id:'remera-zorro-gris',      nombre:'Remera Zorro gris',      cat:'ninos', sub:'remeras',  talles:'6 al 12',  colores:['Lime green'],    precio:15900, precioAntes:0, img:'assets/img/remera-zorro-gris.webp',      destacado:false, guiaTalles:'remera-nino' },
    { id:'remera-yaguarundi',      nombre:'Remera Yaguarundí',      cat:'ninos', sub:'remeras',  talles:'6 al 12',  colores:['Gris melange'],  precio:15900, precioAntes:0, img:'assets/img/remera-yaguarundi.webp',      destacado:false, guiaTalles:'remera-nino' },
    { id:'remera-sierras',         nombre:'Remera Sierras',         cat:'ninos', sub:'remeras',  talles:'6 al 12',  colores:['Rojo'],          precio:15900, precioAntes:0, img:'assets/img/remera-sierras.webp',         destacado:false, guiaTalles:'remera-nino' },
    /* Precio corregido: en la tienda de origen figuraba "$21" (error de tipeo).
       Se usó el mismo precio que sus hermanas de la línea "aplique + estampa
       doble cara" (Pecarí, Gliptodonte, Zorrito), que comparten descripción
       y precio "antes" ($21.900). */
    { id:'remera-yacare',          nombre:'Remera Yacaré con dientes', cat:'ninos', sub:'remeras', talles:'2 al 6', colores:['Verde manzana'], precio:15900, precioAntes:0, img:'assets/img/remera-yacare-con-dientes.webp', destacado:false, guiaTalles:'remera-nino' },
    { id:'remera-pecari',          nombre:'Remera Pecarí de collar',  cat:'ninos', sub:'remeras',  talles:'2 al 6',  colores:['Verde manzana'], precio:15900, precioAntes:0, img:'assets/img/remera-pecari-de-collar.webp', destacado:false, guiaTalles:'remera-nino' },
    { id:'remera-gliptodonte',     nombre:'Remera Gliptodonte con cola', cat:'ninos', sub:'remeras', talles:'2 al 6', colores:['Violeta'],     precio:15900, precioAntes:0, img:'assets/img/remera-gliptodonte-con-cola.webp', destacado:true, guiaTalles:'remera-nino' },
    { id:'remera-zorrito-sierra',  nombre:'Remera Zorrito de la sierra', cat:'ninos', sub:'remeras', talles:'2 al 6', colores:['Verde manzana'], precio:15900, precioAntes:0, img:'assets/img/remera-zorrito-de-la-sierra.webp', destacado:false, guiaTalles:'remera-nino' }

  ];

  /* ==========================================================================
     7) OPINIONES
     --------------------------------------------------------------------------
     Reseñas reales de la ficha de Google Maps. No llevan fecha a propósito:
     varias son de hace años y una fecha vieja al lado de "5,0 en Google"
     puede leerse como que el local no tiene reseñas nuevas. Si en algún
     momento sumás opiniones recientes, quedate con las más nuevas primero.
     ========================================================================== */
  var OPINIONES = [
    { nombre: 'Dr. Estanislao Dezi', fecha: '', estrellas: 5,
      texto: 'La mejor confección y diseños únicos que no encontrarás en ningún otro lado, que no sea en Piedra Libre. Muy recomendable.' },
    { nombre: 'Juan Martín Capurro', fecha: '', estrellas: 5,
      texto: 'Excelente ropa, gran calidad y diseño a buen precio. ¡La atención otras 5 estrellas! Gracias por todo. Volveremos.' },
    { nombre: 'Noelia Luz Romero', fecha: '', estrellas: 5,
      texto: '¡Excelente atención, muy amables! Una cosa más linda que otra. Nos llevamos varios regalitos para mi hija y mis sobrinos. Súper recomendable.' }
  ];

  /* ==========================================================================
     8) PREGUNTAS FRECUENTES
     Se muestran en la home y además Google las lee para mostrarlas en el buscador.
     ========================================================================== */
  var FAQS = [
    { q: '¿Cómo sé qué talle pedir?',
      a: 'Mandanos la altura del nene o de la nena por WhatsApp y te decimos cuál pedir. Es lo más seguro: las tablas de talles cambian mucho de una marca a otra y nosotros conocemos las nuestras. Los talles de bebé van del 01 al 04 y los de niños del 2 al 12.' },
    { q: '¿Hacen envíos a todo el país?',
      a: 'Sí, a todo el país. El envío es gratis en compras superiores a $89.000. Debajo de ese monto se cobra el costo del envío según la localidad. También podés retirar en el local sin costo.' },
    { q: '¿Cómo puedo pagar?',
      a: 'Efectivo, débito, crédito en 3 cuotas sin interés, transferencia y QR. Pagando por transferencia tenés 20% de descuento.' },
    { q: '¿Cómo compro?',
      a: 'Entrá a la prenda, elegí el talle y el color, y agregala al carrito (o tocá "Comprar ahora" para ir directo). En el carrito elegís la zona de envío y confirmás el pedido. Por ahora el pago se termina de coordinar por WhatsApp; muy pronto vas a poder pagar ahí mismo con Mercado Pago.' },
    { q: '¿La ropa es de algodón?',
      a: 'Sí, toda. Trabajamos con algodón porque es lo que mejor aguanta el uso diario y no pica. Los apliques también son de tela de algodón, cosidos sobre la prenda.' },
    { q: '¿Cómo se lavan los apliques?',
      a: 'Lavado normal, del revés, con agua fría o tibia. No hace falta nada especial. Evitá el secarropas a temperatura alta y no planches directamente sobre la estampa.' },
    { q: '¿Puedo cambiar una prenda?',
      a: 'Sí. Tenés 30 días desde que la recibís para cambiarla por otro talle o por otro modelo, siempre que esté sin usar y con la etiqueta. Escribinos por WhatsApp y coordinamos.' },
    { q: '¿Hacen prendas a pedido?',
      a: 'Sí. Si querés un diseño en un color que no está publicado, o un talle que no figura, escribinos y vemos. Fabricamos nosotros, así que hay margen.' },
    { q: '¿Dónde queda el local?',
      a: 'En Don Julio 150, Los Molles, San Luis, a pocos minutos de Merlo. Si venís de paseo, pasá y probate las prendas.' }
  ];

  /* ==========================================================================
     9) NOMBRES QUE PASAN EN LA TIRA EN MOVIMIENTO
     ========================================================================== */
  var TIRA = ['Zorro gris', 'Tortuga', 'Cóndor andino', 'Yaguarundí', 'Chinita', 'Puma', 'Colibrí', 'Flor de cardón', 'Molle'];

  /* ==========================================================================
     10) MENSAJES QUE SE ESCRIBEN SOLOS EN WHATSAPP
     ========================================================================== */
  var MENSAJES = {
    generico: 'Hola! Vi la web y quería consultar por...',
    talle:    'Hola! Necesito una mano con el talle. La altura del nene/a es de ',
    pedido:   'Hola! Quería consultar por un diseño a pedido.',
    producto: function (nombre) {
      return 'Hola! Me interesa el/la ' + nombre + '. ¿Tienen talle disponible?';
    }
  };

  /* ==========================================================================
     DE ACÁ PARA ABAJO NO HACE FALTA TOCAR NADA
     ========================================================================== */
  window.__BRAND__ = {
    whatsapp:            WHATSAPP,
    whatsappPlaceholder: '5492656000000',
    marca:               MARCA,
    condiciones:         CONDICIONES,
    envio:               ENVIO,
    categorias:          CATEGORIAS,
    colores:             COLORES,
    talles:              TALLES,
    productos:           PRODUCTOS,
    opiniones:           OPINIONES,
    faqs:                FAQS,
    tira:                TIRA,
    mensajes:            MENSAJES
  };
})();
