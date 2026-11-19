// JavaScript mínimo del sitio público. Sin dependencias: todo lo importante
// funciona también sin JS (los filtros son un <form> GET con <noscript>).
(function () {
  'use strict';

  // Menú móvil
  var btn = document.querySelector('[data-menu]');
  var panel = document.querySelector('[data-menu-panel]');
  if (btn && panel) {
    btn.addEventListener('click', function () {
      var abierto = panel.classList.toggle('hidden') === false;
      btn.setAttribute('aria-expanded', abierto ? 'true' : 'false');
    });
  }

  // Desplegables del menú (details.nav-drop): solo uno abierto a la vez y se
  // cierran al hacer clic fuera o con Escape. Sin JS siguen funcionando como
  // <details> normales.
  var drops = Array.prototype.slice.call(document.querySelectorAll('details[data-drop]'));
  drops.forEach(function (d) {
    d.addEventListener('toggle', function () {
      if (d.open) drops.forEach(function (otro) { if (otro !== d) otro.open = false; });
    });
  });
  document.addEventListener('click', function (e) {
    drops.forEach(function (d) { if (d.open && !d.contains(e.target)) d.open = false; });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') drops.forEach(function (d) { d.open = false; });
  });

  // Filtros de la oferta: al cambiar un select se reenvía el formulario, y los
  // parámetros vacíos se quitan para que la URL quede limpia y compartible.
  var filtros = document.querySelector('[data-filtros]');
  if (filtros) {
    var reenviar = function () {
      filtros.querySelectorAll('input,select').forEach(function (el) {
        if (!el.value) el.disabled = true;
      });
      filtros.submit();
    };
    filtros.querySelectorAll('select').forEach(function (sel) {
      sel.addEventListener('change', reenviar);
    });
    var q = filtros.querySelector('input[name="q"]');
    if (q) {
      q.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          reenviar();
        }
      });
    }
  }

  // Antispam de tiempo mínimo: marca cuándo se abrió el formulario.
  document.querySelectorAll('form[data-tmin]').forEach(function (f) {
    var campo = f.querySelector('input[name="_t"]');
    if (campo) campo.value = String(Date.now());
  });
})();
