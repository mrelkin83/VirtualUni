/**
 * Widget incrustable de VirtualUni (§13.2). La institución pega en su web:
 *
 *   <div data-virtualuni="inscripcion" data-convocatoria="auxiliar-contable"></div>
 *   <script src="https://su-subdominio.ejemplo.edu.co/embed.js" async></script>
 *
 * Tipos: oferta | programa (data-slug) | inscripcion (data-convocatoria) |
 * estado | validar. Opciones: data-color (acento), data-alto-minimo.
 * El iframe apunta al MISMO origen del que se cargó este script (el
 * subdominio o dominio propio de la institución en VirtualUni); el host
 * exige además que el dominio que incrusta esté en la lista blanca del
 * tenant (frame-ancestors), así que fuera de ella el navegador no lo pinta.
 *
 * Eventos hacia la página madre (CustomEvent en document):
 *   virtualuni:step, virtualuni:application_submitted, virtualuni:payment_started
 * Ejemplo:
 *   document.addEventListener('virtualuni:application_submitted', function (e) {
 *     gtag('event', 'conversion', { send_to: 'AW-XXXX/YYYY', transaction_id: e.detail.code });
 *   });
 */
(function () {
  'use strict';

  var script = document.currentScript;
  if (!script) return;
  var origen;
  try {
    origen = new URL(script.src).origin;
  } catch (e) {
    return;
  }

  var RUTAS = {
    oferta: function () { return '/embed/oferta'; },
    programa: function (el) { return '/embed/programa/' + (el.getAttribute('data-slug') || ''); },
    inscripcion: function (el) { return '/embed/inscripcion/' + (el.getAttribute('data-convocatoria') || ''); },
    estado: function () { return '/embed/estado'; },
    validar: function () { return '/embed/validar'; },
  };

  var marcos = [];

  function montar(el) {
    var tipo = el.getAttribute('data-virtualuni');
    var ruta = RUTAS[tipo];
    if (!ruta) return;
    var url = new URL(origen + ruta(el));
    var color = el.getAttribute('data-color');
    if (color && /^#[0-9a-fA-F]{3,8}$/.test(color)) url.searchParams.set('color', color);

    var iframe = document.createElement('iframe');
    iframe.src = url.toString();
    iframe.style.width = '100%';
    iframe.style.border = '0';
    iframe.style.minHeight = (parseInt(el.getAttribute('data-alto-minimo') || '480', 10) || 480) + 'px';
    iframe.setAttribute('title', 'VirtualUni — ' + tipo);
    iframe.setAttribute('loading', 'lazy');
    iframe.setAttribute('allow', 'clipboard-write');
    el.appendChild(iframe);
    marcos.push(iframe);
  }

  window.addEventListener('message', function (ev) {
    // Solo mensajes del host del widget, y solo hacia iframes nuestros.
    if (ev.origin !== origen || !ev.data || !ev.data.virtualuni) return;
    var fuente = marcos.find(function (f) { return f.contentWindow === ev.source; });
    if (!fuente) return;
    if (ev.data.virtualuni === 'height') {
      fuente.style.height = ev.data.height + 'px';
      return;
    }
    document.dispatchEvent(new CustomEvent('virtualuni:' + ev.data.virtualuni, { detail: ev.data.data || {} }));
  });

  document.querySelectorAll('[data-virtualuni]').forEach(montar);
})();
