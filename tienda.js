/* BODY QUEEN · lógica de la tienda (versión pública sin base de datos).
   Los datos editables están en config.js. */
(function () {
  "use strict";
  var C = window.BQ_CONFIG;
  var P = C.producto;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var DEPARTAMENTOS = ["Amazonas", "Antioquia", "Arauca", "Archipiélago de San Andrés, Providencia y Santa Catalina", "Atlántico", "Bogotá D.C.", "Bolívar", "Boyacá", "Caldas", "Caquetá", "Casanare", "Cauca", "Cesar", "Chocó", "Córdoba", "Cundinamarca", "Guainía", "Guaviare", "Huila", "La Guajira", "Magdalena", "Meta", "Nariño", "Norte de Santander", "Putumayo", "Quindío", "Risaralda", "Santander", "Sucre", "Tolima", "Valle del Cauca", "Vaupés", "Vichada"];

  // ------------------------------------------------------------ utilidades
  function cop(n) { return "$" + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function tel(d) { return d.length === 10 ? d.slice(0, 3) + " " + d.slice(3, 6) + " " + d.slice(6) : d; }
  function wa(texto) { return "https://wa.me/" + C.whatsapp.replace(/\D/g, "") + (texto ? "?text=" + encodeURIComponent(texto) : ""); }
  function guardar(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function leer(k) { try { return JSON.parse(localStorage.getItem(k) || "null"); } catch (e) { return null; } }
  function disponible(color, talla) { return C.agotados.indexOf(color + "-" + talla) === -1; }
  function colorDe(nombre) { return C.colores.filter(function (c) { return c.nombre === nombre; })[0]; }
  function track(ev, params) {
    try {
      if (window.fbq) window.fbq("track", ev, Object.assign({ currency: "COP" }, params || {}));
      var ga = { AddToCart: "add_to_cart", InitiateCheckout: "begin_checkout", Purchase: "purchase", ViewContent: "view_item" }[ev];
      if (window.gtag && ga) window.gtag("event", ga, Object.assign({ currency: "COP" }, params || {}));
    } catch (e) {}
  }
  function bloquear(si) { document.body.classList.toggle("bloqueado", si); }

  // ------------------------------------------------------------ precios
  // Combinación de promociones más económica (grupos de 3, luego 2, luego 1).
  function calcular(unidades) {
    var promos = C.promociones.slice().sort(function (a, b) { return b.unidades - a.unidades; });
    var mejor = [0], eleccion = [0];
    for (var i = 1; i <= unidades; i++) {
      mejor[i] = mejor[i - 1] + P.precio; eleccion[i] = 1;
      promos.forEach(function (p) {
        if (p.unidades <= i && mejor[i - p.unidades] + p.precio < mejor[i]) { mejor[i] = mejor[i - p.unidades] + p.precio; eleccion[i] = p.unidades; }
      });
    }
    var cuenta = {};
    for (var j = unidades; j > 0; j -= eleccion[j]) cuenta[eleccion[j]] = (cuenta[eleccion[j]] || 0) + 1;
    var detalle = Object.keys(cuenta).map(Number).sort(function (a, b) { return b - a; }).map(function (u) {
      return { unidades: u, veces: cuenta[u], precio: u === 1 ? P.precio : promos.filter(function (p) { return p.unidades === u; })[0].precio };
    });
    var lista = unidades * P.precio;
    return { subtotal: lista, total: mejor[unidades] || 0, descuento: lista - (mejor[unidades] || 0), detalle: detalle };
  }
  function textoPromo(detalle) {
    return detalle.filter(function (d) { return d.unidades > 1; }).map(function (d) { return d.veces + " × Pack " + d.unidades + " unidades (" + cop(d.precio) + ")"; }).join(" + ");
  }

  // ------------------------------------------------------------ contenido fijo
  $$("[data-precio-base]").forEach(function (e) { e.textContent = cop(P.precio); });
  $$("[data-nombre]").forEach(function (e) { e.textContent = P.nombre; });
  $$("[data-material]").forEach(function (e) { e.textContent = P.material; });
  $$("[data-desc-corta]").forEach(function (e) { e.textContent = P.descripcionCorta; });
  $("#descripcion").innerHTML = P.descripcion.map(function (p) { return "<p>" + esc(p) + "</p>"; }).join("");
  $$("[data-wa]").forEach(function (a) { a.href = wa(); });
  $("#waFlotante").href = wa("Hola BODY QUEEN, quiero información sobre la Faja Quita Fácil.");
  $("#anio").textContent = new Date().getFullYear();

  var ofertas = [{ unidades: 1, precio: P.precio, destacada: false }].concat(C.promociones);
  $("#promoMini").innerHTML = ofertas.map(function (o) {
    var ahorro = o.unidades * P.precio - o.precio;
    return '<div class="' + (o.destacada ? "top" : "") + '"><small>' + o.unidades + (o.unidades === 1 ? " faja" : " fajas") + "</small><b>" + cop(o.precio) + "</b><em>" + (ahorro > 0 ? "Ahorras " + cop(ahorro) : "Precio regular") + "</em></div>";
  }).join("");
  $("#ofertas").innerHTML = ofertas.map(function (o) {
    var normal = o.unidades * P.precio, ahorro = normal - o.precio;
    return '<article class="oferta' + (o.destacada ? " top" : "") + '">' + (o.destacada ? '<span class="sello">Mejor precio</span>' : "") +
      '<p class="eyebrow ' + (o.destacada ? "" : "dorado") + '">' + o.unidades + (o.unidades === 1 ? " faja" : " fajas") + "</p>" +
      '<p class="valor">' + cop(o.precio) + "</p>" +
      (ahorro > 0 ? '<p class="tachado">' + cop(normal) + '</p><span class="ahorro">Ahorras ' + cop(ahorro) + '</span><p class="unidad">' + cop(Math.round(o.precio / o.unidades)) + " por faja</p>" : '<p class="unidad">Precio individual</p>') +
      '<a href="#comprar" class="btn ' + (o.destacada ? "btn-negro" : "btn-borde-claro") + '">Elegir</a></article>';
  }).join("");

  var hayMedidas = C.guiaTallas.some(function (t) { return t.cintura || t.cadera; });
  $("#tablaTallas").innerHTML = C.guiaTallas.map(function (t) {
    return "<tr><td>" + esc(t.talla) + "</td><td>" + (esc(t.cintura) || "—") + "</td><td>" + (esc(t.cadera) || "—") + "</td></tr>";
  }).join("");
  $("#notaTallas").textContent = hayMedidas
    ? "¿Dudas con tu talla? Escríbenos por WhatsApp y te asesoramos."
    : "Las medidas de referencia se publicarán próximamente. Mientras tanto, escríbenos por WhatsApp y te ayudamos a elegir tu talla.";

  if (C.testimonios.length) {
    $("#testimonios").hidden = false;
    $("#listaTestimonios").innerHTML = C.testimonios.map(function (t) {
      return '<figure class="testimonio"><blockquote>“' + esc(t.texto) + '”</blockquote><figcaption>' + esc(t.nombre) + (t.ciudad ? " · " + esc(t.ciudad) : "") + "</figcaption></figure>";
    }).join("");
  }

  var promoTxt = C.promociones.map(function (p) { return p.unidades + " fajas por " + cop(p.precio); }).join(" y ");
  var faq = [
    ["¿Cómo puedo comprar?", "Elige el color y la talla, agrega las fajas al carrito y presiona «Finalizar compra». Completa tus datos de envío, confirma y se abrirá WhatsApp con el resumen de tu pedido listo para enviárnoslo. Tu pedido queda confirmado cuando nos llega ese mensaje."],
    ["¿Cuánto cuesta el envío?", "El envío es GRATIS a toda Colombia. No se suma ningún costo de envío al total de tu pedido."],
    ["¿Cómo funciona el pago contraentrega?", "No pagas nada por adelantado. Pagas el valor total de tu pedido en el momento en que lo recibes."],
    ["¿Qué tallas están disponibles?", "La Faja Quita Fácil está disponible en tallas S, M, L, XL, 2XL y 3XL, en colores beige, blanco y negro, sujeto a disponibilidad de cada combinación."],
    ["¿Cómo puedo elegir mi talla?", "Consulta la guía de tallas de esta página. Si tienes dudas, escríbenos por WhatsApp y te ayudamos a elegir."],
    ["¿Puedo combinar diferentes colores?", "Sí. Puedes combinar colores y tallas en un mismo pedido y la promoción se aplica sobre el total de fajas. Precio individual: " + cop(P.precio) + (promoTxt ? ". Promociones: " + promoTxt + "." : ".")],
    ["¿Cómo puedo comunicarme con atención al cliente?", "Escríbenos por WhatsApp al " + C.whatsappVisible + " o usa el botón verde de WhatsApp disponible en toda la tienda."],
  ];
  $("#listaPreguntas").innerHTML = faq.map(function (f) { return '<details class="pregunta"><summary>' + esc(f[0]) + "</summary><p>" + esc(f[1]) + "</p></details>"; }).join("");

  var contacto = ['<a href="' + wa() + '" target="_blank" rel="noopener">WhatsApp ' + esc(C.whatsappVisible) + "</a>"];
  if (C.email) contacto.push('<a href="mailto:' + esc(C.email) + '">' + esc(C.email) + "</a>");
  if (C.horario) contacto.push('<span class="dato">' + esc(C.horario) + "</span>");
  [["Instagram", C.instagram], ["Facebook", C.facebook], ["TikTok", C.tiktok]].forEach(function (r) {
    if (r[1] && /^https:\/\//.test(r[1])) contacto.push('<a href="' + esc(r[1]) + '" target="_blank" rel="noopener">' + r[0] + "</a>");
  });
  $("#pieContacto").insertAdjacentHTML("beforeend", contacto.join(""));

  // ------------------------------------------------------------ fotos
  function marcador(texto, oscuro) {
    return '<div class="marcador' + (oscuro ? " oscuro" : "") + '" role="img" aria-label="' + esc(texto) + ' — imagen provisional"><b>BQ</b><span>' + esc(texto) + "</span><small>Imagen provisional · fotografía próximamente</small></div>";
  }
  function img(f, clase) { return '<img class="' + (clase || "foto") + '" src="' + esc(f.archivo) + '" alt="' + esc(f.descripcion || P.nombre) + '" loading="lazy">'; }
  var portada = C.fotoPortada ? { archivo: C.fotoPortada, descripcion: P.nombre + " — BODY QUEEN" } : C.fotos[0];
  $("#heroFoto").innerHTML = portada ? img(portada).replace('loading="lazy"', 'fetchpriority="high"') : marcador("Fotografía principal", true);

  // ------------------------------------------------------------ selección
  var estado = {
    color: (C.colores.filter(function (c) { return C.tallas.some(function (t) { return disponible(c.nombre, t); }); })[0] || C.colores[0]).nombre,
    talla: null,
    cantidad: 1,
    foto: 0,
  };

  function fotosDelColor() {
    var propias = C.fotos.filter(function (f) { return f.color === estado.color; });
    var generales = C.fotos.filter(function (f) { return !f.color; });
    return propias.length ? propias.concat(generales) : C.fotos;
  }

  function pintarGaleria() {
    var lista = fotosDelColor();
    var actual = lista[estado.foto] || lista[0];
    $("#galeriaPrincipal").innerHTML = '<span class="etiqueta-flotante">Envío gratis</span>' + (actual ? img(actual) : marcador("Faja Quita Fácil · " + estado.color));
    $("#galeriaMiniaturas").innerHTML = lista.length > 1 ? lista.map(function (f, i) {
      return '<button type="button" data-foto="' + i + '" class="' + (i === estado.foto ? "activa" : "") + '" aria-label="Ver imagen ' + (i + 1) + '">' + img(f) + "</button>";
    }).join("") : "";
  }

  function pintarSelectores() {
    $("#colorElegido").textContent = estado.color;
    $("#colores").innerHTML = C.colores.map(function (c) {
      var hay = C.tallas.some(function (t) { return disponible(c.nombre, t); });
      return '<button type="button" class="color" data-color="' + esc(c.nombre) + '" aria-pressed="' + (c.nombre === estado.color) + '" aria-label="Color ' + esc(c.nombre) + (hay ? "" : ", agotado") + '"><i style="background:' + esc(c.muestra) + '"></i>' + esc(c.nombre) + (hay ? "" : " <small>(agotado)</small>") + "</button>";
    }).join("");
    $("#tallaElegida").innerHTML = estado.talla ? ": <b>" + esc(estado.talla) + "</b>" : "";
    $("#tallas").innerHTML = C.tallas.map(function (t) {
      var hay = disponible(estado.color, t);
      return '<button type="button" class="talla" data-talla="' + esc(t) + '" aria-pressed="' + (t === estado.talla) + '"' + (hay ? "" : " disabled") + ' aria-label="Talla ' + esc(t) + (hay ? "" : ", agotada") + '">' + esc(t) + "</button>";
    }).join("");
    $("#cantidad").textContent = estado.cantidad;
    $("#menos").disabled = estado.cantidad <= 1;
    $("#mas").disabled = estado.cantidad >= maxCantidad();
    var hayAlgo = C.colores.some(function (c) { return C.tallas.some(function (t) { return disponible(c.nombre, t); }); });
    $("#agregar").textContent = !hayAlgo ? "Agotado temporalmente" : estado.talla ? "Agregar al carrito" : "Selecciona tu talla";
    $("#agregar").disabled = $("#comprarYa").disabled = !hayAlgo;
  }

  function maxCantidad() { return Math.max(1, Math.min(10, C.maximoPorPedido - unidades())); }

  function aviso(texto, error) {
    var a = $("#aviso");
    a.hidden = false; a.textContent = texto; a.className = "aviso" + (error ? " error" : "");
    a.setAttribute("role", error ? "alert" : "status");
  }

  $("#colores").addEventListener("click", function (e) {
    var b = e.target.closest("[data-color]"); if (!b) return;
    estado.color = b.dataset.color; estado.foto = 0; $("#aviso").hidden = true;
    if (estado.talla && !disponible(estado.color, estado.talla)) estado.talla = null;
    pintarSelectores(); pintarGaleria();
  });
  $("#tallas").addEventListener("click", function (e) {
    var b = e.target.closest("[data-talla]"); if (!b || b.disabled) return;
    estado.talla = b.dataset.talla; $("#aviso").hidden = true; pintarSelectores();
  });
  $("#galeriaMiniaturas").addEventListener("click", function (e) {
    var b = e.target.closest("[data-foto]"); if (!b) return;
    estado.foto = Number(b.dataset.foto); pintarGaleria();
  });
  $("#menos").addEventListener("click", function () { estado.cantidad = Math.max(1, estado.cantidad - 1); pintarSelectores(); });
  $("#mas").addEventListener("click", function () { estado.cantidad = Math.min(maxCantidad(), estado.cantidad + 1); pintarSelectores(); });

  function agregar(irAPagar) {
    if (!estado.talla) { aviso("Selecciona una talla disponible.", true); return; }
    if (!disponible(estado.color, estado.talla)) { aviso("Esta combinación está agotada. Elige otra talla o color.", true); return; }
    if (unidades() + estado.cantidad > C.maximoPorPedido) { aviso("Máximo " + C.maximoPorPedido + " fajas por pedido. Para más unidades escríbenos por WhatsApp.", true); return; }
    var existente = carrito.filter(function (l) { return l.color === estado.color && l.talla === estado.talla; })[0];
    if (existente) existente.cantidad += estado.cantidad;
    else carrito.push({ color: estado.color, talla: estado.talla, cantidad: estado.cantidad });
    track("AddToCart", { value: P.precio * estado.cantidad, num_items: estado.cantidad });
    var txt = "Agregado: " + estado.color + " · Talla " + estado.talla + " × " + estado.cantidad;
    estado.cantidad = 1;
    guardarCarrito();
    if (irAPagar) abrirCheckout();
    else { aviso(txt); abrirCarrito(); }
  }
  $("#agregar").addEventListener("click", function () { agregar(false); });
  $("#comprarYa").addEventListener("click", function () { agregar(true); });

  // ------------------------------------------------------------ carrito
  var CLAVE = "bq_carrito_v1";
  var carrito = (leer(CLAVE) || []).filter(function (l) {
    return l && colorDe(l.color) && C.tallas.indexOf(l.talla) > -1 && l.cantidad > 0 && l.cantidad <= 100;
  });
  function unidades() { return carrito.reduce(function (s, l) { return s + l.cantidad; }, 0); }
  function problemas() {
    var lista = carrito.filter(function (l) { return !disponible(l.color, l.talla); }).map(function (l) { return l.color + " talla " + l.talla + " está agotada: retírala del carrito."; });
    if (unidades() > C.maximoPorPedido) lista.push("Máximo " + C.maximoPorPedido + " fajas por pedido.");
    return lista;
  }
  function guardarCarrito() { guardar(CLAVE, carrito); pintarCarrito(); pintarSelectores(); }

  function resumenHTML(conContraentrega) {
    var r = calcular(unidades()), u = unidades();
    return '<div class="resumen">' +
      '<div><span class="gris">Subtotal (' + u + (u === 1 ? " unidad" : " unidades") + ")</span><span>" + cop(r.subtotal) + "</span></div>" +
      '<div><span class="gris">Descuento promoción' + (r.descuento > 0 ? "<small>" + esc(textoPromo(r.detalle)) + "</small>" : "") + "</span><span" + (r.descuento > 0 ? ' class="oro-oscuro"' : "") + ">" + (r.descuento > 0 ? "-" + cop(r.descuento) : cop(0)) + "</span></div>" +
      '<div><span class="gris">Envío a toda Colombia</span><span class="gratis">GRATIS</span></div>' +
      '<div class="total"><span>Total a pagar</span><b>' + cop(r.total) + "</b></div>" +
      (conContraentrega ? '<p class="contraentrega">Pago <b>CONTRAENTREGA</b>: pagas cuando recibes tu pedido.</p>' : "") +
      "</div>";
  }

  function empujonHTML() {
    var u = unidades(); if (!u) return "";
    var sig = C.promociones.filter(function (p) { return p.unidades > u; }).sort(function (a, b) { return a.unidades - b.unidades; })[0];
    if (!sig) return '<p class="empujon">✦ ¡Estás aprovechando nuestra mejor promoción!</p>';
    var falta = sig.unidades - u;
    return '<p class="empujon">✦ Agrega ' + falta + (falta === 1 ? " faja más" : " fajas más") + " y lleva " + sig.unidades + " por <b>" + cop(sig.precio) + "</b> (ahorras " + cop(sig.unidades * P.precio - sig.precio) + "). Puedes combinar colores y tallas.</p>";
  }

  function lineasHTML(editable) {
    return carrito.map(function (l, i) {
      var c = colorDe(l.color), agotada = !disponible(l.color, l.talla);
      return '<div class="linea-carrito"><div class="linea-carrito__muestra"><i style="background:' + esc(c.muestra) + '"></i></div>' +
        '<div class="linea-carrito__info"><h4>' + esc(P.nombre) + "</h4><small>" + esc(l.color) + " · Talla " + esc(l.talla) + "</small>" +
        (agotada ? '<p class="nota" style="color:var(--rojo)">Agotada</p>' : "") +
        '<div class="linea-carrito__fila">' +
        (editable
          ? '<div class="cantidad chica"><button type="button" data-menos="' + i + '"' + (l.cantidad <= 1 ? " disabled" : "") + ' aria-label="Quitar una unidad de ' + esc(l.color) + " talla " + esc(l.talla) + '">−</button><span>' + l.cantidad + '</span><button type="button" data-mas="' + i + '"' + (unidades() >= C.maximoPorPedido ? " disabled" : "") + ' aria-label="Agregar una unidad de ' + esc(l.color) + " talla " + esc(l.talla) + '">+</button></div>'
          : '<span class="gris">Cantidad: ' + l.cantidad + "</span>") +
        "<span>" + cop(P.precio * l.cantidad) + "</span></div></div>" +
        (editable ? '<button type="button" class="quitar" data-quitar="' + i + '">Eliminar</button>' : "") + "</div>";
    }).join("");
  }

  function pintarCarrito() {
    var u = unidades();
    var cont = $("#contador"); cont.hidden = !u; cont.textContent = u;
    $("#abrirCarrito").setAttribute("aria-label", "Abrir carrito (" + u + " productos)");
    $("#barraBoton").textContent = u ? "Ver carrito (" + u + ")" : "Comprar ahora";
    if (!u) {
      $("#lineasCarrito").innerHTML = '<div class="vacio"><h3>Tu carrito está vacío</h3><p class="nota">Elige tu color y tu talla para comenzar.</p><a href="#comprar" class="btn btn-negro" data-cerrar>Ver la faja</a></div>';
      $("#pieCarrito").innerHTML = ""; $("#pieCarrito").hidden = true; return;
    }
    $("#pieCarrito").hidden = false;
    $("#lineasCarrito").innerHTML = lineasHTML(true);
    var errores = problemas();
    $("#pieCarrito").innerHTML = empujonHTML() +
      (errores.length ? '<p class="error-general" role="alert">' + errores.map(esc).join("<br>") + "</p>" : "") +
      resumenHTML(false) +
      '<button type="button" class="btn btn-negro btn-ancho" id="irAPagar"' + (errores.length ? " disabled" : "") + ">Finalizar compra</button>" +
      '<button type="button" class="seguir" data-cerrar>Seguir comprando</button>';
  }

  function cambiarCantidad(e) {
    var t = e.target.closest("[data-menos],[data-mas],[data-quitar]"); if (!t) return;
    if (t.dataset.menos) carrito[t.dataset.menos].cantidad = Math.max(1, carrito[t.dataset.menos].cantidad - 1);
    if (t.dataset.mas && unidades() < C.maximoPorPedido) carrito[t.dataset.mas].cantidad += 1;
    if (t.dataset.quitar) carrito.splice(Number(t.dataset.quitar), 1);
    guardarCarrito();
    if (!$("#checkout").hidden) pintarCheckout();
  }
  $("#carrito").addEventListener("click", function (e) {
    if (e.target.closest("#irAPagar")) { abrirCheckout(); return; }
    cambiarCantidad(e);
  });

  // ------------------------------------------------------------ capas
  var ultimoFoco = null;
  function abrir(id) { ultimoFoco = document.activeElement; $(id).hidden = false; bloquear(true); var f = $(id + " [data-cerrar]"); if (f) f.focus({ preventScroll: true }); }
  function cerrar(capa) { capa.hidden = true; bloquear(!$$(".capa").every(function (c) { return c.hidden; })); if (ultimoFoco) ultimoFoco.focus({ preventScroll: true }); }
  function abrirCarrito() { pintarCarrito(); abrir("#carrito"); }
  $("#abrirCarrito").addEventListener("click", abrirCarrito);
  $$(".capa").forEach(function (capa) {
    capa.addEventListener("click", function (e) { if (e.target.closest("[data-cerrar]")) cerrar(capa); });
  });
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    var abiertas = $$(".capa").filter(function (c) { return !c.hidden; });
    if (abiertas.length) cerrar(abiertas[abiertas.length - 1]);
    if (!$("#menuMovil").hidden) cerrarMenu();
  });

  function cerrarMenu() { $("#menuMovil").hidden = true; $("#abrirMenu").setAttribute("aria-expanded", "false"); bloquear(false); }
  $("#abrirMenu").addEventListener("click", function () { $("#menuMovil").hidden = false; $("#abrirMenu").setAttribute("aria-expanded", "true"); bloquear(true); });
  $("#menuMovil").addEventListener("click", function (e) { if (e.target === this || e.target.closest("a, #cerrarMenu")) cerrarMenu(); });

  var TITULOS = { privacidad: "Política de privacidad", terminos: "Términos y condiciones", envios: "Política de envíos", cambios: "Cambios y devoluciones" };
  $$("[data-politica]").forEach(function (b) {
    b.addEventListener("click", function () {
      var k = b.dataset.politica, texto = (C.politicas[k] || "").trim();
      $("#politicaTitulo").textContent = TITULOS[k];
      $("#politicaTexto").innerHTML = texto ? "<p>" + esc(texto) + "</p>" : '<p class="gris">Este documento se encuentra en preparación y será publicado próximamente. Si tienes alguna pregunta, escríbenos por WhatsApp.</p>';
      abrir("#politica");
    });
  });

  // ------------------------------------------------------------ checkout
  var paso = "datos", datos = { nombre: "", celular: "", departamento: "", ciudad: "", direccion: "", barrio: "", indicaciones: "" }, errores = {};

  function abrirCheckout() {
    if (!$("#carrito").hidden) $("#carrito").hidden = true;
    paso = unidades() ? "datos" : paso; errores = {};
    pintarCheckout(); abrir("#checkout"); $(".pantalla").scrollTop = 0;
    track("InitiateCheckout", { num_items: unidades() });
  }

  function campo(id, etiqueta, html) {
    return '<div class="campo' + (errores[id] ? " error" : "") + '"><label class="etiqueta" for="f-' + id + '">' + etiqueta + "</label>" + html +
      (errores[id] ? '<p class="msg" id="e-' + id + '">' + esc(errores[id]) + "</p>" : "") + "</div>";
  }
  function input(id, attrs) {
    return '<input id="f-' + id + '" name="' + id + '" value="' + esc(datos[id]) + '" ' + (attrs || "") + (errores[id] ? ' aria-invalid="true" aria-describedby="e-' + id + '"' : "") + ">";
  }

  function pasosHTML() {
    return '<ol class="pasos"><li class="' + (paso === "datos" ? "activo" : "hecho") + '"><b>' + (paso === "datos" ? "1" : "✓") + "</b>Datos de envío</li><li>—</li><li class=\"" + (paso === "revisar" ? "activo" : "") + '"><b>2</b>Confirmación</li></ol>';
  }

  function pintarCheckout() {
    var cuerpo = $("#checkoutCuerpo");
    if (paso === "listo") return;
    if (!unidades()) {
      cuerpo.innerHTML = '<div class="tarjeta relleno vacio"><h3>Tu carrito está vacío</h3><p class="nota">Agrega tus fajas para finalizar la compra.</p><button class="btn btn-negro" data-cerrar>Ver la faja</button></div>';
      return;
    }
    var errs = problemas();
    var izquierda;
    if (paso === "datos") {
      izquierda = '<form class="tarjeta relleno" id="formDatos" novalidate><h2>¿A dónde enviamos tu pedido?</h2>' +
        (errs.length ? '<p class="error-general">' + errs.map(esc).join("<br>") + "</p>" : "") +
        campo("nombre", "Nombre completo *", input("nombre", 'autocomplete="name" maxlength="100" required')) +
        campo("celular", "Número de celular *", input("celular", 'type="tel" inputmode="tel" autocomplete="tel-national" placeholder="312 345 6789" maxlength="20" required')) +
        '<div class="dos">' +
        campo("departamento", "Departamento *", '<select id="f-departamento" name="departamento" required' + (errores.departamento ? ' aria-invalid="true"' : "") + '><option value="">Selecciona…</option>' +
          DEPARTAMENTOS.map(function (d) { return "<option" + (d === datos.departamento ? " selected" : "") + ">" + esc(d) + "</option>"; }).join("") + "</select>") +
        campo("ciudad", "Ciudad o municipio *", input("ciudad", 'autocomplete="address-level2" maxlength="80" required')) +
        "</div>" +
        campo("direccion", "Dirección completa *", input("direccion", 'autocomplete="street-address" placeholder="Calle 10 # 20-30, apto 401" maxlength="160" required')) +
        campo("barrio", "Barrio *", input("barrio", 'maxlength="80" required')) +
        campo("indicaciones", "Indicaciones adicionales para la entrega", '<textarea id="f-indicaciones" name="indicaciones" maxlength="300" placeholder="Ej.: casa esquinera, portería, horario de entrega…">' + esc(datos.indicaciones) + "</textarea>") +
        '<div class="trampa" aria-hidden="true"><label for="f-web">No llenar</label><input id="f-web" name="web" tabindex="-1" autocomplete="off"></div>' +
        '<button type="submit" class="btn btn-negro btn-ancho"' + (errs.length ? " disabled" : "") + ">Revisar pedido</button></form>";
    } else {
      var r = calcular(unidades());
      izquierda = '<div class="tarjeta relleno"><h2>Confirma tu pedido</h2><dl class="datos">' +
        [["Nombre", datos.nombre], ["Celular", tel(datos.celular)], ["Departamento", datos.departamento], ["Ciudad", datos.ciudad], ["Dirección", datos.direccion, 1], ["Barrio", datos.barrio], ["Indicaciones", datos.indicaciones || "Ninguna", 1]]
          .map(function (d) { return '<div class="' + (d[2] ? "ancho" : "") + '"><dt>' + d[0] + "</dt><dd>" + esc(d[1]) + "</dd></div>"; }).join("") +
        '</dl><div class="chips"><span class="chip" style="color:var(--verde);border-color:rgba(63,107,74,.3)">Envío gratis</span><span class="chip" style="color:var(--negro);border-color:var(--linea)">Método de pago: contraentrega</span></div>' +
        '<label class="confirmar"><input type="checkbox" id="confirmo"><span>Confirmo que mis datos son correctos y que pagaré <b>' + cop(r.total) + "</b> contraentrega al recibir mi pedido.</span></label>" +
        '<p class="nota">Al confirmar se abrirá WhatsApp con el resumen de tu pedido para que nos lo envíes al ' + esc(C.whatsappVisible) + ". Tu pedido queda confirmado cuando recibimos ese mensaje.</p><br>" +
        '<p class="error-general" id="errorConfirmar" hidden></p>' +
        '<div class="acciones"><button type="button" class="btn btn-borde" id="editar">Editar datos</button><button type="button" class="btn btn-negro" id="confirmar">Confirmar pedido</button></div></div>';
    }
    cuerpo.innerHTML = '<p class="eyebrow oro-oscuro">Pago contraentrega · Envío gratis</p><h1 class="display" style="font-size:clamp(2.3rem,5vw,3.2rem);margin:10px 0 0">Finalizar compra</h1>' +
      '<div class="checkout"><div>' + pasosHTML() + izquierda + '</div><aside class="tarjeta relleno" aria-label="Resumen de compra"><h2>Resumen de compra</h2>' +
      lineasHTML(paso === "datos") + '<div style="display:grid;gap:14px;margin-top:16px">' + (paso === "datos" ? empujonHTML() : "") + resumenHTML(true) + "</div></aside></div>";
  }

  function validar() {
    var e = {}, limpio = function (s) { return String(s || "").replace(/\s+/g, " ").trim(); };
    datos.nombre = limpio(datos.nombre);
    var cel = String(datos.celular).replace(/\D/g, ""); if (cel.length === 12 && cel.indexOf("57") === 0) cel = cel.slice(2);
    ["ciudad", "direccion", "barrio", "indicaciones"].forEach(function (k) { datos[k] = limpio(datos[k]); });
    if (datos.nombre.length < 3 || datos.nombre.length > 100 || !/^[\p{L}\s.'-]+$/u.test(datos.nombre)) e.nombre = "Escribe tu nombre completo (solo letras).";
    if (!/^3\d{9}$/.test(cel)) e.celular = "Escribe un celular colombiano de 10 dígitos (ej. 312 345 6789).";
    else datos.celular = cel;
    if (DEPARTAMENTOS.indexOf(datos.departamento) === -1) e.departamento = "Selecciona tu departamento.";
    if (datos.ciudad.length < 2) e.ciudad = "Escribe tu ciudad o municipio.";
    if (datos.direccion.length < 5) e.direccion = "Escribe la dirección completa.";
    if (datos.barrio.length < 2) e.barrio = "Escribe tu barrio.";
    if (datos.indicaciones.length > 300) e.indicaciones = "Máximo 300 caracteres.";
    return e;
  }

  function numeroPedido() {
    var d = new Date(), p = function (n) { return String(n).padStart(2, "0"); };
    var letras = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789", r = "";
    var bytes = new Uint8Array(4); (window.crypto || window.msCrypto).getRandomValues(bytes);
    for (var i = 0; i < 4; i++) r += letras[bytes[i] % letras.length];
    return "BQ-" + String(d.getFullYear()).slice(2) + p(d.getMonth() + 1) + p(d.getDate()) + "-" + r;
  }

  function mensaje(numero) {
    var r = calcular(unidades()), L = [];
    L.push("NUEVO PEDIDO - BODY QUEEN", "", "Número de pedido: #" + numero, "", "DATOS DEL CLIENTE:");
    L.push("Nombre: " + datos.nombre, "Celular: " + tel(datos.celular), "Departamento: " + datos.departamento, "Ciudad: " + datos.ciudad, "Dirección: " + datos.direccion, "Barrio: " + datos.barrio, "Indicaciones: " + (datos.indicaciones || "Ninguna"));
    L.push("", "PRODUCTOS:");
    carrito.forEach(function (l, i) { if (i) L.push(""); L.push("Producto: " + P.nombre, "Color: " + l.color, "Talla: " + l.talla, "Cantidad: " + l.cantidad); });
    L.push("", "RESUMEN:", "Unidades: " + unidades());
    var promo = textoPromo(r.detalle); if (promo) L.push("Promoción: " + promo);
    L.push("Subtotal: " + cop(r.subtotal), "Descuento: " + (r.descuento > 0 ? "-" + cop(r.descuento) : cop(0)), "Envío: GRATIS", "Total a pagar: " + cop(r.total), "", "Método de pago: CONTRAENTREGA.");
    return L.join("\n");
  }

  function copiar(texto, boton) {
    var ok = function () { boton.textContent = "✓ Mensaje copiado"; setTimeout(function () { boton.textContent = "Copiar mensaje"; }, 2500); };
    if (navigator.clipboard) navigator.clipboard.writeText(texto).then(ok, respaldo); else respaldo();
    function respaldo() {
      var t = document.createElement("textarea"); t.value = texto; t.style.position = "fixed"; t.style.opacity = "0";
      document.body.appendChild(t); t.select();
      try { if (document.execCommand("copy")) ok(); } catch (e) {}
      document.body.removeChild(t);
    }
  }

  function pintarListo(numero, texto, total) {
    var url = wa(texto);
    $("#checkoutCuerpo").innerHTML = '<div class="exito"><div class="exito__cab"><span class="check">✓</span><p class="eyebrow dorado" style="margin-top:18px">Último paso</p><h2>Pedido #' + esc(numero) + "</h2></div>" +
      '<div class="exito__cuerpo"><p class="alerta-oro"><b>Envíanos el mensaje por WhatsApp para confirmar tu pedido.</b><br>Si WhatsApp no se abrió automáticamente, presiona el botón verde, o copia el mensaje y envíalo al ' + esc(C.whatsappVisible) + ". Total a pagar contraentrega: <b>" + cop(total) + "</b>.</p>" +
      '<div class="dos-botones"><a class="btn btn-wa" href="' + url + '" target="_blank" rel="noopener">Enviar pedido por WhatsApp</a><button type="button" class="btn btn-borde" id="copiar">Copiar mensaje</button></div>' +
      '<pre class="mensaje" aria-label="Mensaje del pedido">' + esc(texto) + "</pre>" +
      '<button type="button" class="seguir" data-cerrar>Volver a la tienda</button></div></div>';
    $("#copiar").addEventListener("click", function () { copiar(texto, this); });
  }

  var cuerpo = $("#checkoutCuerpo");
  cuerpo.addEventListener("input", function (e) {
    var n = e.target.name; if (n && n in datos) { datos[n] = e.target.value; }
  });
  cuerpo.addEventListener("change", function (e) { var n = e.target.name; if (n && n in datos) datos[n] = e.target.value; });
  cuerpo.addEventListener("submit", function (e) {
    e.preventDefault();
    if ($("#f-web") && $("#f-web").value) return; // bot
    errores = validar();
    var claves = Object.keys(errores);
    if (claves.length) { pintarCheckout(); var f = $("#f-" + claves[0]); if (f) f.focus(); return; }
    if (problemas().length) return;
    paso = "revisar"; pintarCheckout(); $(".pantalla").scrollTop = 0;
  });
  cuerpo.addEventListener("click", function (e) {
    if (e.target.closest("#editar")) { paso = "datos"; pintarCheckout(); return; }
    if (e.target.closest("#confirmar")) {
      if (!$("#confirmo").checked) { var ec = $("#errorConfirmar"); ec.hidden = false; ec.textContent = "Marca la casilla para confirmar tu pedido."; return; }
      if (problemas().length || !unidades()) return;
      var numero = numeroPedido(), texto = mensaje(numero), total = calcular(unidades()).total;
      track("Purchase", { value: total, num_items: unidades() });
      window.open(wa(texto), "_blank", "noopener");
      paso = "listo";
      carrito = []; guardarCarrito();
      pintarListo(numero, texto, total);
      $(".pantalla").scrollTop = 0;
      return;
    }
    if (paso === "datos") cambiarCantidad(e);
  });
  $("#checkout").addEventListener("click", function (e) {
    if (e.target.closest("[data-cerrar]") && paso === "listo") { paso = "datos"; datos = { nombre: "", celular: "", departamento: "", ciudad: "", direccion: "", barrio: "", indicaciones: "" }; }
  });

  // ------------------------------------------------------------ barra móvil y cabecera
  $("#barraBoton").addEventListener("click", function () { if (unidades()) abrirCarrito(); else $("#comprar").scrollIntoView({ behavior: "smooth" }); });
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (en) { $("#barraMovil").classList.toggle("oculta", en[0].isIntersecting); }).observe($("#comprar"));
  }
  window.addEventListener("scroll", function () { $("#cabecera").classList.toggle("con-sombra", window.scrollY > 10); }, { passive: true });

  // ------------------------------------------------------------ analítica opcional
  if (/^\d{5,20}$/.test(C.metaPixelId || "")) {
    !function (f, b, e, v, n, t, s) { if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); }; if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = "2.0"; n.queue = []; t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s); }(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
    window.fbq("init", C.metaPixelId); window.fbq("track", "PageView");
  }
  if (/^G-[A-Z0-9]{4,20}$/.test(C.googleAnalyticsId || "")) {
    var s = document.createElement("script"); s.async = true; s.src = "https://www.googletagmanager.com/gtag/js?id=" + C.googleAnalyticsId; document.head.appendChild(s);
    window.dataLayer = window.dataLayer || []; window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date()); window.gtag("config", C.googleAnalyticsId);
  }

  pintarSelectores(); pintarGaleria(); pintarCarrito();
  track("ViewContent", { value: P.precio });

  // Expuesto solo para pruebas automáticas
  window.__BQ_TEST__ = { calcular: calcular };
})();
