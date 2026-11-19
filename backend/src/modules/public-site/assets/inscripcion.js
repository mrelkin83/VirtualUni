// Asistente de inscripción y consulta del aspirante. JavaScript vanilla sin
// dependencias: habla con /aspirante/api/* (JSON) del MISMO host del tenant.
(function () {
  'use strict';

  var api = function (ruta, opciones) {
    return fetch('/aspirante/api' + ruta, Object.assign({ credentials: 'same-origin' }, opciones || {})).then(
      function (r) {
        return r.json().catch(function () { return {}; }).then(function (cuerpo) {
          if (!r.ok) {
            var msg = (cuerpo && (cuerpo.message && cuerpo.message.join ? cuerpo.message.join(' · ') : cuerpo.message)) || 'Algo salió mal';
            var err = new Error(msg);
            err.status = r.status;
            throw err;
          }
          return cuerpo;
        });
      },
    );
  };

  var ETIQUETA_ESTADO = {
    BORRADOR: ['Borrador', 'bg-gray-100 text-gray-700'],
    ENVIADA: ['Enviada', 'bg-blue-100 text-blue-800'],
    PAGO_PENDIENTE: ['Pago pendiente', 'bg-amber-100 text-amber-800'],
    PAGO_EN_VERIFICACION: ['Pago en verificación', 'bg-amber-100 text-amber-800'],
    PAGADA: ['Pagada', 'bg-emerald-100 text-emerald-800'],
    EN_REVISION: ['En revisión', 'bg-indigo-100 text-indigo-800'],
    DOCUMENTOS_INCOMPLETOS: ['Corrige tus documentos', 'bg-red-100 text-red-800'],
    ADMITIDA: ['¡Admitida!', 'bg-emerald-100 text-emerald-800'],
    NO_ADMITIDA: ['No admitida', 'bg-gray-200 text-gray-700'],
    MATRICULADA: ['Matriculada', 'bg-emerald-200 text-emerald-900'],
    DESISTIO: ['Desistió', 'bg-gray-200 text-gray-600'],
  };

  // ============================================================== asistente

  var form = document.querySelector('[data-inscripcion]');
  if (form) iniciarAsistente(form);

  function iniciarAsistente(form) {
    var estado = { code: null, docs: [], datos: {} };
    var errorBox = document.querySelector('[data-error]');
    var marcaT = form.querySelector('input[name="_t"]');
    if (marcaT) marcaT.value = String(Date.now());

    var campo = function (nombre) {
      return form.querySelector('[data-campo="' + nombre + '"]');
    };
    var valor = function (nombre) {
      var el = campo(nombre);
      if (!el) return undefined;
      if (el.type === 'checkbox') return el.checked;
      return el.value.trim() || undefined;
    };

    function error(msj) {
      if (!msj) { errorBox.classList.add('hidden'); return; }
      errorBox.textContent = msj;
      errorBox.classList.remove('hidden');
      errorBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    function mostrarPaso(n) {
      form.querySelectorAll('[data-paso]').forEach(function (f) {
        f.classList.toggle('hidden', f.getAttribute('data-paso') !== String(n));
      });
      document.querySelectorAll('[data-paso-tab]').forEach(function (t) {
        var activo = Number(t.getAttribute('data-paso-tab')) <= Number(n);
        t.style.background = activo ? 'var(--c1)' : '';
        t.style.color = activo ? '#fff' : '';
      });
      error(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Menor de edad → bloque del acudiente (fuera de colegio, donde ya es fijo)
    var esColegio = form.getAttribute('data-colegio') === '1';
    var nacimiento = campo('birthDate');
    if (nacimiento && !esColegio) {
      nacimiento.addEventListener('change', function () {
        var menor = esMenor(nacimiento.value);
        document.querySelector('[data-acudiente-menor]').classList.toggle('hidden', !menor);
        document.querySelector('[data-consent-acudiente]').classList.toggle('hidden', !menor);
        document.querySelector('[data-consent-acudiente]').classList.toggle('flex', menor);
      });
    }
    if (esColegio) {
      var ca = document.querySelector('[data-consent-acudiente]');
      ca.classList.remove('hidden');
      ca.classList.add('flex');
    }

    function esMenor(fecha) {
      if (!fecha) return false;
      var n = new Date(fecha);
      var hoy = new Date();
      var edad = hoy.getFullYear() - n.getFullYear();
      if (hoy.getMonth() < n.getMonth() || (hoy.getMonth() === n.getMonth() && hoy.getDate() < n.getDate())) edad--;
      return edad < 18;
    }

    function acudiente() {
      // En colegio hay dos bloques con los mismos data-campo (visible el primero);
      // querySelector toma el primero visible por orden del DOM.
      var g = {
        nombre: valor('guardian.nombre'),
        documento: valor('guardian.documento'),
        parentesco: valor('guardian.parentesco'),
        telefono: valor('guardian.telefono'),
      };
      return g.nombre || g.documento ? g : undefined;
    }

    function paso1() {
      var requiereAcudiente = esColegio || esMenor(valor('birthDate'));
      var cuerpo = {
        callSlug: form.getAttribute('data-call'),
        documentType: valor('documentType'),
        documentNumber: valor('documentNumber'),
        firstName: valor('firstName'),
        lastName: valor('lastName'),
        email: valor('email'),
        phone: valor('phone'),
        birthDate: valor('birthDate'),
        city: valor('city'),
        targetLevel: valor('targetLevel') ? Number(valor('targetLevel')) : undefined,
        guardian: requiereAcudiente ? acudiente() : undefined,
        guardianConsent: requiereAcudiente ? !!valor('guardianConsent') : undefined,
        submittedByGuardian: esColegio || undefined,
        web: form.querySelector('input[name="web"]').value || undefined,
        _t: form.querySelector('input[name="_t"]').value,
      };
      api('/borrador', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cuerpo),
      })
        .then(function (r) {
          estado.code = r.code;
          estado.docs = r.requiredDocuments;
          estado.datos = cuerpo;
          pintarDocs();
          mostrarPaso(2);
        })
        .catch(function (e) { error(e.message); });
    }

    function paso2() {
      api('/borrador/' + estado.code, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ previousEducation: valor('previousEducation') }),
      })
        .then(function () { mostrarPaso(3); })
        .catch(function (e) { error(e.message); });
    }

    function pintarDocs() {
      var cont = form.querySelector('[data-lista-docs]');
      cont.innerHTML = '';
      estado.docs.forEach(function (d) {
        var fila = document.createElement('div');
        fila.className = 'rounded-lg border border-gray-200 p-3';
        fila.innerHTML =
          '<div class="flex items-center justify-between gap-3 flex-wrap">' +
          '<p class="text-sm font-semibold text-gray-800">' + d.name + (d.required ? ' *' : ' <span class="text-gray-400 font-normal">(opcional)</span>') + '</p>' +
          '<span data-estado class="text-xs font-bold ' + (d.subido ? 'text-emerald-600' : 'text-gray-400') + '">' + (d.subido ? '✔ Subido' : 'Pendiente') + '</span>' +
          '</div>' +
          '<div class="mt-2 flex items-center gap-3">' +
          '<input type="file" accept="application/pdf,image/jpeg,image/png" class="text-sm flex-1" />' +
          '<progress max="100" value="0" class="w-24 hidden"></progress>' +
          '</div>';
        var input = fila.querySelector('input[type=file]');
        input.addEventListener('change', function () {
          if (input.files && input.files[0]) subirDoc(d, input.files[0], fila);
        });
        cont.appendChild(fila);
      });
    }

    function subirDoc(doc, archivo, fila) {
      var barra = fila.querySelector('progress');
      var sello = fila.querySelector('[data-estado]');
      barra.classList.remove('hidden');
      var fd = new FormData();
      fd.append('file', archivo);
      var xhr = new XMLHttpRequest();
      xhr.open('POST', '/aspirante/api/borrador/' + estado.code + '/documentos/' + doc.id);
      xhr.withCredentials = true;
      xhr.upload.onprogress = function (e) {
        if (e.lengthComputable) barra.value = Math.round((e.loaded / e.total) * 100);
      };
      xhr.onload = function () {
        barra.classList.add('hidden');
        if (xhr.status >= 200 && xhr.status < 300) {
          doc.subido = true;
          sello.textContent = '✔ Subido';
          sello.className = 'text-xs font-bold text-emerald-600';
          error(null);
        } else {
          var msj = 'No se pudo subir el archivo';
          try { msj = JSON.parse(xhr.responseText).message || msj; } catch (e2) { /* texto plano */ }
          error(Array.isArray(msj) ? msj.join(' · ') : msj);
        }
      };
      xhr.onerror = function () { barra.classList.add('hidden'); error('Error de conexión subiendo el archivo'); };
      xhr.send(fd);
    }

    function paso3() {
      var faltan = estado.docs.filter(function (d) { return d.required && !d.subido; });
      if (faltan.length) {
        return error('Falta subir: ' + faltan.map(function (d) { return d.name; }).join(', '));
      }
      var dl = form.querySelector('[data-resumen]');
      var dd = estado.datos;
      dl.innerHTML =
        '<div><dt class="inline font-semibold">Aspirante:</dt> <dd class="inline">' + dd.firstName + ' ' + dd.lastName + '</dd></div>' +
        '<div><dt class="inline font-semibold">Documento:</dt> <dd class="inline">' + dd.documentType + ' ' + dd.documentNumber + '</dd></div>' +
        '<div><dt class="inline font-semibold">Contacto:</dt> <dd class="inline">' + dd.email + ' · ' + dd.phone + '</dd></div>' +
        '<div><dt class="inline font-semibold">Código de solicitud:</dt> <dd class="inline font-mono">' + estado.code + '</dd></div>';
      mostrarPaso(4);
    }

    function enviar() {
      var btn = form.querySelector('[data-accion="enviar"]');
      if (!valor('consent')) return error('Debes autorizar el tratamiento de datos para enviar');
      btn.disabled = true;
      api('/borrador/' + estado.code + '/enviar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ consent: true }),
      })
        .then(function (r) {
          form.querySelector('[data-code-final]').textContent = r.code;
          if (r.applicationFee > 0) form.querySelector('[data-pago-aviso]').classList.remove('hidden');
          conversion(r.code);
          mostrarPaso('ok');
        })
        .catch(function (e) { error(e.message); })
        .then(function () { btn.disabled = false; });
    }

    /** Evento de conversión al ENVIAR la solicitud (§3). */
    function conversion(code) {
      var ga4 = form.getAttribute('data-ga4');
      var ads = form.getAttribute('data-ads');
      try {
        if (window.gtag && ga4) window.gtag('event', 'generate_lead', { transaction_id: code });
        if (window.gtag && ads) window.gtag('event', 'conversion', { send_to: ads, transaction_id: code });
        if (window.fbq && form.getAttribute('data-pixel')) window.fbq('track', 'SubmitApplication');
      } catch (e) { /* la medición jamás rompe el envío */ }
    }

    function otroHijo() {
      // Conserva el acudiente (y la sesión); limpia los datos del estudiante.
      ['documentType', 'documentNumber', 'firstName', 'lastName', 'birthDate', 'targetLevel'].forEach(function (n) {
        var el = campo(n);
        if (el) el.value = '';
      });
      estado.code = null;
      estado.docs = [];
      mostrarPaso(1);
    }

    form.addEventListener('click', function (e) {
      var accion = e.target && e.target.getAttribute && e.target.getAttribute('data-accion');
      if (!accion) return;
      e.preventDefault();
      if (accion === 'paso1') paso1();
      else if (accion === 'paso2') paso2();
      else if (accion === 'paso3') paso3();
      else if (accion === 'enviar') enviar();
      else if (accion === 'otro-hijo') otroHijo();
      else if (accion === 'volver') {
        var actual = e.target.closest('[data-paso]').getAttribute('data-paso');
        mostrarPaso(Number(actual) - 1);
      }
    });

    mostrarPaso(1);
  }

  // ============================================ consulta del aspirante

  var formEnlace = document.querySelector('[data-form-enlace]');
  if (formEnlace) {
    var t0 = formEnlace.querySelector('input[name="_t"]');
    if (t0) t0.value = String(Date.now());
    formEnlace.addEventListener('submit', function (e) {
      e.preventDefault();
      var msg = formEnlace.querySelector('[data-msg-enlace]');
      api('/enlace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentNumber: formEnlace.documentNumber.value.trim(),
          email: formEnlace.email.value.trim(),
          web: formEnlace.web.value || undefined,
          _t: formEnlace.querySelector('input[name="_t"]').value,
        }),
      })
        .then(function (r) { msg.textContent = r.message; msg.classList.remove('hidden'); })
        .catch(function (err) { msg.textContent = err.message; msg.classList.remove('hidden'); });
    });
  }

  var zona = document.querySelector('[data-solicitudes]');
  if (zona && zona.getAttribute('data-autenticado')) cargarSolicitudes(zona);

  function cargarSolicitudes(zona) {
    api('/mis-solicitudes')
      .then(function (lista) {
        if (!lista.length) {
          zona.innerHTML = '<p class="text-sm text-gray-500">No encontramos solicitudes asociadas a tu correo.</p>';
          return;
        }
        zona.innerHTML = '';
        lista.forEach(function (s) { zona.appendChild(tarjetaSolicitud(s)); });
      })
      .catch(function () {
        zona.innerHTML = '<p class="text-sm text-amber-700">Tu sesión venció. Pide un nuevo enlace de acceso recargando esta página.</p>';
      });
  }

  function tarjetaSolicitud(s) {
    var est = ETIQUETA_ESTADO[s.status] || [s.status, 'bg-gray-100 text-gray-700'];
    var el = document.createElement('div');
    el.className = 'rounded-xl border border-gray-200 p-5';
    var docs = s.documentos
      .map(function (d) {
        var sello =
          d.estado === 'APROBADO' ? '<span class="text-emerald-600 font-bold">✔ aprobado</span>'
          : d.estado === 'RECHAZADO' ? '<span class="text-red-600 font-bold">✖ rechazado</span>'
          : d.estado ? '<span class="text-gray-500">en revisión</span>'
          : '<span class="text-gray-400">sin subir</span>';
        var nota = d.reviewNote && d.estado === 'RECHAZADO' ? '<p class="text-xs text-red-600 mt-0.5">' + d.reviewNote + '</p>' : '';
        var corregir =
          d.estado === 'RECHAZADO'
            ? '<input type="file" data-corregir data-code="' + s.code + '" data-doc="' + d.id + '" accept="application/pdf,image/jpeg,image/png" class="text-xs mt-1" />'
            : '';
        return '<li class="py-1.5"><span class="text-gray-700">' + d.name + '</span> · ' + sello + nota + corregir + '</li>';
      })
      .join('');
    el.innerHTML =
      '<div class="flex items-start justify-between gap-3 flex-wrap">' +
      '<div><p class="font-black text-gray-900">' + (s.programa || 'Solicitud') + '</p>' +
      '<p class="text-xs text-gray-500">' + s.aspirante + ' · <span class="font-mono">' + s.code + '</span></p></div>' +
      '<span class="text-xs font-bold px-2.5 py-1 rounded-full ' + est[1] + '">' + est[0] + '</span>' +
      '</div>' +
      (s.status === 'PAGO_PENDIENTE' || s.status === 'PAGO_EN_VERIFICACION'
        ? '<div class="mt-3 text-sm bg-amber-50 border border-amber-200 text-amber-900 rounded-lg px-3 py-2.5">' +
          '<p class="font-bold">Pago de inscripción: $' + Number(s.applicationFee).toLocaleString('es-CO') + '</p>' +
          (s.paymentInstructions
            ? '<p class="mt-1 whitespace-pre-line">' + escapar(s.paymentInstructions) + '</p>'
            : '<p class="mt-1">La institución te indicará cómo pagar.</p>') +
          (s.status === 'PAGO_EN_VERIFICACION'
            ? '<p class="mt-2 font-semibold">✔ Comprobante recibido: estamos verificando tu pago.</p>'
            : (s.pagoEnLinea
                ? '<button type="button" data-wompi data-code="' + s.code + '" class="mt-2 mr-3 inline-block rounded-lg px-4 py-2 text-white font-bold" style="background:var(--c1)">Pagar en línea</button>'
                : '') +
              '<label class="mt-2 inline-block font-semibold underline cursor-pointer">Subir comprobante (PDF o foto)' +
              '<input type="file" data-comprobante data-code="' + s.code + '" accept="application/pdf,image/jpeg,image/png" class="hidden" /></label>') +
          '</div>'
        : '') +
      '<ul class="mt-3 text-sm divide-y divide-gray-100">' + docs + '</ul>';
    el.addEventListener('click', function (e) {
      var btn = e.target;
      if (!btn.hasAttribute || !btn.hasAttribute('data-wompi')) return;
      btn.disabled = true;
      api('/borrador/' + btn.getAttribute('data-code') + '/wompi')
        .then(function (r) { location.href = r.url; })
        .catch(function (err) { alert(err.message); btn.disabled = false; });
    });
    el.addEventListener('change', function (e) {
      var input = e.target;
      if (!input.hasAttribute || !input.files || !input.files[0]) return;
      var esCorreccion = input.hasAttribute('data-corregir');
      var esComprobante = input.hasAttribute('data-comprobante');
      if (!esCorreccion && !esComprobante) return;
      var fd = new FormData();
      fd.append('file', input.files[0]);
      var ruta = esComprobante
        ? '/aspirante/api/borrador/' + input.getAttribute('data-code') + '/comprobante'
        : '/aspirante/api/borrador/' + input.getAttribute('data-code') + '/documentos/' + input.getAttribute('data-doc');
      fetch(ruta, { method: 'POST', body: fd, credentials: 'same-origin' }).then(function (r) {
        if (r.ok) location.reload();
        else r.json().then(function (c) { alert((c.message && c.message.join ? c.message.join(' · ') : c.message) || 'No se pudo subir'); });
      });
    });
    return el;
  }

  function escapar(texto) {
    var div = document.createElement('div');
    div.textContent = String(texto);
    return div.innerHTML;
  }
})();
