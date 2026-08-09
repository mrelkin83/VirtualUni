#!/usr/bin/env node
/**
 * bitacora.mjs — Convierte las transcripciones de Claude Code (JSONL) en una
 * bitácora legible dentro del repositorio.
 *
 *   Entrada : ~/.claude/projects/<slug-del-proyecto>/*.jsonl
 *   Salida  : docs/bitacora/AAAA-MM-DD-<sesion>.md  +  INDICE.md
 *   Estado  : docs/bitacora/.estado.json  (permite reejecución incremental)
 *
 * Uso:
 *   node scripts/bitacora.mjs                  # incremental (solo lo nuevo)
 *   node scripts/bitacora.mjs --simulacion     # no escribe nada; muestra qué haría
 *   node scripts/bitacora.mjs --rehacer        # regenera todo desde cero
 *   node scripts/bitacora.mjs --redactar-emails
 *   node scripts/bitacora.mjs --todas-las-salidas
 *   node scripts/bitacora.mjs --proyecto <dir> --salida <dir>
 *
 * Sin dependencias externas: solo Node >= 18.
 */

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

// ───────────────────────────────────────────────────────────── configuración ──

const ARGS = process.argv.slice(2);
const flag = (n) => ARGS.includes(n);
const opt = (n, def) => {
  const i = ARGS.indexOf(n);
  return i >= 0 && ARGS[i + 1] ? ARGS[i + 1] : def;
};

const CFG = {
  simulacion: flag('--simulacion') || flag('--dry-run'),
  rehacer: flag('--rehacer'),
  redactarEmails: flag('--redactar-emails'),
  todasLasSalidas: flag('--todas-las-salidas'), // variante A
  proyecto: path.resolve(opt('--proyecto', process.cwd())),
  salida: opt('--salida', null),
  // truncado de salidas de herramientas
  headLineas: 10,
  tailLineas: 5,
  maxCaracteresLinea: 400,
  // resumen de respuestas
  maxResumen: 700,
  maxArgumentos: 180,
};
CFG.salida = CFG.salida
  ? path.resolve(CFG.salida)
  : path.join(CFG.proyecto, 'docs', 'bitacora');

const ZONA = 'America/Bogota';

// ───────────────────────────────────────────────────────────────── redacción ──

const MARCA = '«REDACTADO»';

/** Valores que NO son secretos aunque aparezcan tras `password:` etc. */
const NO_ES_SECRETO = new Set([
  'string', 'number', 'boolean', 'any', 'unknown', 'object', 'null', 'undefined',
  'true', 'false', 'string?', 'String', 'Number', 'Boolean', 'Date', 'text',
  'varchar', 'char', 'int', 'bigint', 'hash', 'bcrypt', 'argon2', 'required',
  'optional', 'estado', 'email', 'nombre', 'id',
]);

const CLAVES_SECRETAS =
  'password|passwd|pwd|pass|db_password|database_url|postgres_password|mysql_password|' +
  'jwt_secret|jwt_refresh_secret|refresh_secret|session_secret|cookie_secret|' +
  'secret_key|secret|api_key|apikey|access_token|refresh_token|auth_token|token|' +
  'client_secret|private_key|smtp_pass|smtp_password|pgpassword|mysql_pwd';

/** Reglas de sustitución. Se aplican en orden. */
const REGLAS = [
  // 1. Claves privadas completas (primero: son multilínea)
  [/-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/g,
    () => '«CLAVE-PRIVADA-REDACTADA»'],
  [/\bssh-(rsa|ed25519|dss)\s+AAAA[0-9A-Za-z+/=]{20,}/g,
    () => '«CLAVE-SSH-REDACTADA»'],

  // 2. Tokens con prefijo reconocible
  [/\b(sk-[A-Za-z0-9_-]{16,}|sk_(?:live|test)_[A-Za-z0-9]{8,}|gh[pousr]_[A-Za-z0-9]{20,}|xox[baprs]-[A-Za-z0-9-]{8,}|AKIA[0-9A-Z]{16}|AIza[0-9A-Za-z_-]{30,})/g,
    () => '«TOKEN-REDACTADO»'],

  // 3. JWT
  [/\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}(?:\.[A-Za-z0-9_-]+)?/g,
    () => '«JWT-REDACTADO»'],

  // 4. Cabeceras de autorización
  [/\b(Bearer|Basic)\s+[A-Za-z0-9._~+/=-]{16,}/gi,
    (_m, esquema) => `${esquema} ${MARCA}`],

  // 5. DATABASE_URL: se redacta el valor completo.
  //    El `\\?` cubre las comillas escapadas (\") de JSON citado. NO se exige
  //    comilla de cierre: si el texto viene truncado, exigirla dejaba pasar el
  //    secreto entero (fallo real detectado en la primera pasada).
  [/\b(DATABASE_URL|DIRECT_URL|SHADOW_DATABASE_URL)(\s*[:=]\s*\\?)(["'`]?)([^\s"'`\\,;)}\]]{4,})/gi,
    (m, clave, sep, comilla, valor) =>
      esVariable(valor) ? m : `${clave}${sep}${comilla}${MARCA}`],

  // 6. clave = valor  (solo si el valor parece un literal, no un tipo TS)
  [new RegExp(`\\b(${CLAVES_SECRETAS})(\\s*[:=]\\s*\\\\?)(["'\`]?)([^\\s"'\`\\\\,;)}\\]]{3,})`, 'gi'),
    (m, clave, sep, comilla, valor) =>
      NO_ES_SECRETO.has(valor) || esVariable(valor)
        ? m
        : `${clave}${sep}${comilla}${MARCA}`],

  // 6b. Listas de contraseñas candidatas (`for p in 'a' 'b' 'c'` al tantear login).
  //     No hay pareja clave=valor, así que ninguna regla anterior las ve.
  [/\b(for\s+\w+\s+in\s+)((?:(['"])[^'"\n]{1,40}\3\s+){2,}(['"])[^'"\n]{1,40}\4)/g,
    (m, cabecera) =>
      /pass|clave|contrase|psql|mysql|mongo|login|secret|token/i.test(m)
        ? `${cabecera}«LISTA-DE-CLAVES-REDACTADA»`
        : m],

  // 7. URLs de conexión con credenciales embebidas
  [/\b([a-z][a-z0-9+.-]*):\/\/([^\s:@/"'`\\]{1,64}):([^\s@/"'`\\]{1,128})@/gi,
    (_m, esquema, usuario) => `${esquema}://${usuario}:${MARCA}@`],

  // 8. Contraseñas pasadas por línea de comandos
  [/\b(PGPASSWORD|MYSQL_PWD)=(\S+)/g, (_m, k) => `${k}=${MARCA}`],
  [/\b(mysql|mysqldump|psql|mongo|mongodump|redis-cli)\b([^\n]{0,120}?)(--password=|-p(?=\S))(\S+)/gi,
    (_m, cmd, medio, bandera) => `${cmd}${medio}${bandera}${MARCA}`],
];

/* ── Secretos literales del propio proyecto ────────────────────────────────
 * Las reglas de arriba solo ven parejas `clave=valor`. Un secreto citado
 * suelto (p. ej. una lista de contraseñas candidatas) se les escapa. Por eso
 * se leen los .env reales y se redactan sus valores literales aparezcan donde
 * aparezcan. Los valores nunca se imprimen por consola.
 */
const SECRETOS_LITERALES = [];

const PLACEHOLDERS = new Set([
  'password', 'changeme', 'secret', 'postgres', 'localhost', 'development',
  'production', 'your-secure-password', 'your-password', 'sk_test_...',
  'true', 'false', 'null',
]);

const escRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function cargarSecretosDelProyecto() {
  const archivos = [
    '.env', '.env.local', '.env.production', '.env.development',
    'backend/.env', 'backend/.env.local', 'backend/.env.production',
  ];
  const valores = new Set();

  const registrar = (v) => {
    if (!v) return;
    const limpio = v.trim().replace(/^["'`]|["'`]$/g, '');
    if (limpio.length < 8 || PLACEHOLDERS.has(limpio.toLowerCase())) return;
    valores.add(limpio);
    try {
      const dec = decodeURIComponent(limpio);
      if (dec !== limpio && dec.length >= 8) valores.add(dec);
    } catch { /* no era URL-encoded */ }
    // Raíz alfanumérica: cubre las variantes tanteadas de una misma clave
    // (Clave2024, Clave2024*, clave2024*#, …) sin necesidad de listarlas.
    // Solo si mezcla letras y dígitos, para no redactar palabras comunes
    // del proyecto como "virtualuni".
    const raiz = limpio.match(/^[A-Za-z0-9]{8,}/)?.[0];
    if (raiz && /[A-Za-z]/.test(raiz) && /\d/.test(raiz)) valores.add(raiz);
  };

  // Secretos históricos: los que ya se rotaron siguen apareciendo en las
  // transcripciones antiguas, pero YA NO están en los .env actuales, así que
  // no hay forma de deducirlos. Se listan a mano en un archivo ignorado por git.
  const listaExtra = path.join(CFG.proyecto, 'scripts', '.bitacora-secretos.txt');
  if (fs.existsSync(listaExtra)) {
    for (const l of fs.readFileSync(listaExtra, 'utf8').split('\n')) {
      const v = l.trim();
      if (!v || v.startsWith('#')) continue;
      if (v.length < 6) continue; // demasiado corto: redactaría texto normal
      valores.add(v);
    }
  }

  for (const rel of archivos) {
    const p = path.join(CFG.proyecto, rel);
    if (!fs.existsSync(p)) continue;
    for (const linea of fs.readFileSync(p, 'utf8').split('\n')) {
      const m = linea.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.+)$/);
      if (!m) continue;
      const [, clave, bruto] = m;
      if (!/PASS|SECRET|TOKEN|_KEY|APIKEY|PRIVATE|DATABASE_URL|_URI$/i.test(clave)) continue;
      const valor = bruto.trim().replace(/^["'`]|["'`]$/g, '');
      if (/^(postgres|postgresql|mysql|mongodb|redis)(\+\w+)?:\/\//i.test(valor)) {
        // De una URL de conexión solo interesa la contraseña
        registrar(valor.match(/:\/\/[^:/@]+:([^@/]+)@/)?.[1]);
      } else {
        registrar(valor);
      }
    }
  }

  // Primero los más largos: evita redactar una raíz dentro de un valor completo
  for (const v of [...valores].sort((a, b) => b.length - a.length)) {
    SECRETOS_LITERALES.push(new RegExp(escRe(v), 'gi'));
  }
  return SECRETOS_LITERALES.length;
}

/** ¿El valor es una referencia a variable/plantilla en vez de un literal? */
function esVariable(v) {
  return /^(\$|%|process\.env|import\.meta|env\.|\{\{|<|@|\.\.\.)/.test(v) || v === '...';
}

/** Detector de residuos: si tras redactar sigue habiendo pinta de secreto, se
 *  omite la línea entera. Aplica la regla "ante la duda, no lo publiques". */
const DETECTOR_RESIDUO = new RegExp(
  `\\b(${CLAVES_SECRETAS})\\s*[:=]\\s*["'\`]?[^\\s"'\`,;)}\\]]{8,}`, 'i');

const RE_EMAIL = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,24}\b/g;

let CONTADOR_REDACCIONES = Object.create(null);
function cuenta(k, n = 1) {
  CONTADOR_REDACCIONES[k] = (CONTADOR_REDACCIONES[k] || 0) + n;
}

export function redactar(texto) {
  if (!texto) return '';
  let t = String(texto);

  // Secretos literales del proyecto: primero, y sin depender de la sintaxis
  for (const re of SECRETOS_LITERALES) {
    t = t.replace(re, () => {
      cuenta('secreto-literal-del-proyecto');
      return MARCA;
    });
  }

  for (const [re, sub] of REGLAS) {
    t = t.replace(re, (...a) => {
      const out = sub(...a);
      if (out !== a[0]) cuenta(re.source.slice(0, 28));
      return out;
    });
  }

  if (CFG.redactarEmails) {
    t = t.replace(RE_EMAIL, () => {
      cuenta('email');
      return '«EMAIL-REDACTADO»';
    });
  }

  // Salvaguarda por línea
  if (DETECTOR_RESIDUO.test(t)) {
    t = t
      .split('\n')
      .map((l) => {
        if (!DETECTOR_RESIDUO.test(l) || l.includes('«')) return l;
        const valor = l.match(
          new RegExp(`\\b(?:${CLAVES_SECRETAS})\\s*[:=]\\s*["'\`]?([^\\s"'\`,;)}\\]]+)`, 'i'));
        if (valor && (NO_ES_SECRETO.has(valor[1]) || esVariable(valor[1]))) return l;
        cuenta('salvaguarda-linea');
        return '«LÍNEA OMITIDA POR POSIBLE CREDENCIAL»';
      })
      .join('\n');
  }
  return t;
}

// ───────────────────────────────────────────────────────────────── utilidades ──

function truncar(texto) {
  if (!texto) return '';
  const lineas = String(texto)
    .split('\n')
    .map((l) => (l.length > CFG.maxCaracteresLinea
      ? l.slice(0, CFG.maxCaracteresLinea) + ` … [${l.length - CFG.maxCaracteresLinea} caracteres omitidos]`
      : l));
  const tope = CFG.headLineas + CFG.tailLineas + 3;
  if (lineas.length <= tope) return lineas.join('\n');
  const omitidas = lineas.length - CFG.headLineas - CFG.tailLineas;
  return [
    ...lineas.slice(0, CFG.headLineas),
    `… [${omitidas} líneas omitidas] …`,
    ...lineas.slice(-CFG.tailLineas),
  ].join('\n');
}

const limpiar = (s) =>
  String(s || '').replace(/[​-‏﻿‪-‮]/g, '').trim();

const unaLinea = (s, max) => {
  const t = limpiar(s).replace(/\s+/g, ' ');
  return t.length > max ? t.slice(0, max - 1) + '…' : t;
};

function fmtFecha(iso) {
  const p = new Intl.DateTimeFormat('en-CA', {
    timeZone: ZONA, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
  }).formatToParts(new Date(iso));
  const g = (t) => p.find((x) => x.type === t)?.value ?? '';
  return `${g('year')}-${g('month')}-${g('day')} ${g('hour')}:${g('minute')}:${g('second')}`;
}
function fmtHora(iso) {
  return new Intl.DateTimeFormat('es-CO', {
    timeZone: ZONA, hour: '2-digit', minute: '2-digit', hour12: false,
  }).format(new Date(iso));
}
function fmtDia(iso) {
  const p = new Intl.DateTimeFormat('en-CA', {
    timeZone: ZONA, year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date(iso));
  return p; // AAAA-MM-DD
}
function duracion(a, b) {
  const ms = new Date(b) - new Date(a);
  if (!(ms > 0)) return '—';
  const h = Math.floor(ms / 3.6e6);
  const m = Math.round((ms % 3.6e6) / 6e4);
  return h ? `${h} h ${m} m` : `${m} m`;
}

const escTabla = (s) => String(s).replace(/\|/g, '\\|').replace(/\n/g, ' ');

/** Slug de proyecto tal como lo crea Claude Code. */
function slugProyecto(dir) {
  return dir.replace(/[^A-Za-z0-9]/g, '-');
}

/** Texto plano de un tool_result (puede ser string o array de bloques). */
function textoResultado(bloque) {
  const c = bloque?.content;
  if (typeof c === 'string') return c;
  if (Array.isArray(c)) return c.map((b) => b?.text ?? '').join('\n');
  return '';
}

/** Ruta relativa al proyecto cuando aplica. */
function rutaCorta(p) {
  if (!p) return '';
  const abs = String(p);
  const base = CFG.proyecto;
  if (abs.toLowerCase().startsWith(base.toLowerCase())) {
    return abs.slice(base.length).replace(/^[\\/]/, '').replace(/\\/g, '/');
  }
  return abs.replace(os.homedir(), '~').replace(/\\/g, '/');
}

const HERRAMIENTAS_ARCHIVO = new Set(['Write', 'Edit', 'MultiEdit', 'NotebookEdit']);
const HERRAMIENTAS_COMANDO = new Set(['Bash', 'PowerShell']);

/** Resumen de una línea de los argumentos de una herramienta. */
function resumenAccion(nombre, input = {}) {
  if (HERRAMIENTAS_COMANDO.has(nombre)) {
    const cmd = unaLinea(input.command, CFG.maxArgumentos);
    return input.description ? `\`${cmd}\` — ${unaLinea(input.description, 80)}` : `\`${cmd}\``;
  }
  if (input.file_path) return `\`${rutaCorta(input.file_path)}\``;
  if (input.path) return `\`${rutaCorta(input.path)}\``;
  if (input.pattern) {
    const dónde = input.glob || input.type || input.path;
    return `\`${unaLinea(input.pattern, 80)}\`${dónde ? ` en \`${unaLinea(rutaCorta(dónde), 60)}\`` : ''}`;
  }
  if (input.prompt) return unaLinea(input.prompt, CFG.maxArgumentos);
  if (input.description) return unaLinea(input.description, CFG.maxArgumentos);
  const j = JSON.stringify(input);
  return j && j !== '{}' ? `\`${unaLinea(j, CFG.maxArgumentos)}\`` : '—';
}

const RE_COMMIT = /git\s+commit\b[^\n]*?-m\s*(["'])([\s\S]*?)\1/g;

// ────────────────────────────────────────────────────────────────── análisis ──

function leerSesion(archivo) {
  const registros = [];
  const bruto = fs.readFileSync(archivo, 'utf8');
  for (const linea of bruto.split('\n')) {
    if (!linea.trim()) continue;
    try { registros.push(JSON.parse(linea)); } catch { /* línea parcial: se ignora */ }
  }
  return registros;
}

function analizarSesion(archivo) {
  const registros = leerSesion(archivo);
  const sessionId = path.basename(archivo, '.jsonl');

  // índice de tool_use por id, para poder nombrar cada tool_result
  const porId = new Map();
  for (const r of registros) {
    const c = r?.message?.content;
    if (!Array.isArray(c)) continue;
    for (const b of c) if (b?.type === 'tool_use') porId.set(b.id, b);
  }

  const titulo = [...registros].reverse().find((r) => r?.type === 'ai-title')?.aiTitle || null;
  const conFecha = registros.filter((r) => r?.timestamp);
  const inicio = conFecha[0]?.timestamp || null;
  const fin = conFecha[conFecha.length - 1]?.timestamp || null;
  const meta = registros.find((r) => r?.cwd) || {};

  const intercambios = [];
  let actual = null;
  const cerrar = () => { if (actual) intercambios.push(actual); actual = null; };

  for (const r of registros) {
    const c = r?.message?.content;

    if (r?.type === 'user') {
      const esTexto = typeof c === 'string';
      const texto = esTexto ? c : Array.isArray(c)
        ? c.filter((b) => b?.type === 'text').map((b) => b.text).join('\n')
        : '';

      // Turno real del usuario: promptSource === 'typed'
      if (texto && r.promptSource === 'typed') {
        cerrar();
        actual = {
          ts: r.timestamp,
          prompt: limpiar(texto),
          respuesta: [],
          acciones: [],
          salidas: [],
          archivos: new Map(),
          commits: [],
          errores: 0,
        };
        continue;
      }

      // tool_result
      if (Array.isArray(c) && actual) {
        for (const b of c) {
          if (b?.type !== 'tool_result') continue;
          const tu = porId.get(b.tool_use_id);
          const nombre = tu?.name || '?';
          if (b.is_error) actual.errores++;
          const interesa = CFG.todasLasSalidas
            || HERRAMIENTAS_COMANDO.has(nombre)
            || b.is_error;
          if (!interesa) continue;
          const salida = textoResultado(b).trim();
          if (!salida) continue;
          const idx = actual.acciones.findIndex((a) => a.id === b.tool_use_id);
          actual.salidas.push({
            n: idx >= 0 ? idx + 1 : null,
            nombre,
            error: !!b.is_error,
            resumen: idx >= 0 ? actual.acciones[idx].resumen : nombre,
            texto: truncar(redactar(salida)),
          });
        }
      }
      continue;
    }

    if (r?.type === 'assistant' && Array.isArray(c) && actual) {
      for (const b of c) {
        if (b?.type === 'text' && b.text?.trim()) {
          actual.respuesta.push(limpiar(b.text));
        }
        if (b?.type === 'tool_use') {
          actual.acciones.push({
            id: b.id,
            nombre: b.name,
            resumen: redactar(resumenAccion(b.name, b.input || {})),
          });
          const inp = b.input || {};
          if (HERRAMIENTAS_ARCHIVO.has(b.name) && (inp.file_path || inp.notebook_path)) {
            const k = rutaCorta(inp.file_path || inp.notebook_path);
            const prev = actual.archivos.get(k) || { ops: new Map() };
            prev.ops.set(b.name, (prev.ops.get(b.name) || 0) + 1);
            actual.archivos.set(k, prev);
          }
          if (HERRAMIENTAS_COMANDO.has(b.name) && inp.command) {
            RE_COMMIT.lastIndex = 0;
            let m;
            while ((m = RE_COMMIT.exec(inp.command))) {
              actual.commits.push(unaLinea(m[2].split('\n')[0], 100));
            }
          }
        }
      }
    }
  }
  cerrar();

  return {
    sessionId,
    titulo,
    inicio,
    fin,
    cwd: meta.cwd || null,
    version: meta.version || null,
    intercambios,
    lineas: registros.length,
  };
}

// ─────────────────────────────────────────────────────────────── generación ──

function generarMarkdown(s) {
  const corto = s.sessionId.slice(0, 8);
  const totalAcciones = s.intercambios.reduce((a, i) => a + i.acciones.length, 0);
  const commits = s.intercambios.flatMap((i) => i.commits);

  const L = [];
  L.push(`# Bitácora — Sesión ${corto}`);
  L.push('');
  L.push(`**Fecha:** ${fmtDia(s.inicio)} ${fmtHora(s.inicio)} → ${fmtHora(s.fin)} (COT) · **Duración:** ${duracion(s.inicio, s.fin)}`);
  if (s.titulo) L.push(`**Título:** ${limpiar(s.titulo)}`);
  L.push(`**Directorio:** ${s.cwd || '—'} · **Claude Code** v${s.version || '—'}`);
  L.push(`**Intercambios:** ${s.intercambios.length} · **Acciones:** ${totalAcciones} · **Commits:** ${commits.length || '—'}`);
  L.push('');
  L.push(`<!-- generado por scripts/bitacora.mjs desde ${s.sessionId}.jsonl (${s.lineas} registros) -->`);
  L.push('');

  // Índice interno: una sesión larga puede pasar de 150 KB, y sin esto hay que
  // desplazarse a ciegas para encontrar un intercambio concreto.
  if (s.intercambios.length > 1) {
    L.push('## Intercambios de esta sesión');
    L.push('');
    s.intercambios.forEach((e, i) => {
      const titulo = unaLinea(redactar(e.prompt).split('\n')[0], 70);
      L.push(`${i + 1}. **${fmtHora(e.ts)}** — ${escTabla(titulo)} ` +
        `_(${e.acciones.length} acciones, ${e.archivos.size} archivos)_`);
    });
    L.push('');
  }

  s.intercambios.forEach((e, i) => {
    L.push('---');
    L.push('');
    L.push(`## [${i + 1}] ${fmtFecha(e.ts)} — ${unaLinea(e.prompt.split('\n')[0], 70)}`);
    L.push('');

    L.push('### Lo que pediste');
    L.push('');
    L.push(redactar(e.prompt).split('\n').map((l) => `> ${l}`).join('\n'));
    L.push('');

    L.push('### Lo que respondí (resumen)');
    L.push('');
    if (e.respuesta.length === 0) {
      L.push('_(sin texto de respuesta registrado en esta sesión)_');
    } else {
      const primera = redactar(e.respuesta[0]).slice(0, CFG.maxResumen);
      L.push(primera + (e.respuesta[0].length > CFG.maxResumen ? '…' : ''));
      if (e.respuesta.length > 1) {
        const ultima = redactar(e.respuesta[e.respuesta.length - 1]).slice(0, CFG.maxResumen);
        L.push('');
        L.push(`_(…${e.respuesta.length - 2} mensajes intermedios…)_`);
        L.push('');
        L.push(`**Cierre:** ${ultima}${e.respuesta[e.respuesta.length - 1].length > CFG.maxResumen ? '…' : ''}`);
      }
    }
    L.push('');

    L.push(`### Acciones ejecutadas (${e.acciones.length}${e.errores ? `, ${e.errores} con error` : ''})`);
    L.push('');
    if (e.acciones.length === 0) {
      L.push('_(ninguna)_');
    } else {
      L.push('| # | Herramienta | Qué hizo |');
      L.push('|---|---|---|');
      e.acciones.forEach((a, k) => {
        L.push(`| ${k + 1} | ${a.nombre} | ${escTabla(a.resumen)} |`);
      });
    }
    L.push('');

    if (e.salidas.length) {
      L.push(`### Salidas (${e.salidas.length})`);
      L.push('');
      for (const o of e.salidas) {
        const etiqueta = `${o.n ? `[${o.n}] ` : ''}${o.nombre}${o.error ? ' — ERROR' : ''}: ${unaLinea(o.resumen.replace(/`/g, ''), 90)}`;
        L.push(`<details><summary>${escTabla(etiqueta)}</summary>`);
        L.push('');
        L.push('```');
        L.push(o.texto);
        L.push('```');
        L.push('</details>');
        L.push('');
      }
    }

    if (e.archivos.size) {
      L.push(`### Archivos modificados (${e.archivos.size})`);
      L.push('');
      for (const [ruta, info] of e.archivos) {
        const ops = [...info.ops].map(([n, c]) => `${n} ×${c}`).join(', ');
        L.push(`- \`${ruta}\` (${ops})`);
      }
      L.push('');
    }

    if (e.commits.length) {
      L.push(`### Commits (${e.commits.length})`);
      L.push('');
      for (const c of e.commits) L.push(`- ${c}`);
      L.push('');
    }
  });

  return L.join('\n') + '\n';
}

function generarIndice(resumenes) {
  const L = [];
  L.push('# Índice de bitácora');
  L.push('');
  L.push('Bitácora generada automáticamente desde las transcripciones de Claude Code.');
  L.push('Los secretos (contraseñas, tokens, claves, URLs con credenciales) están redactados.');
  L.push('');
  L.push('| Sesión | Fecha | Duración | Temas | Interc. | Acciones | Commits | Archivo |');
  L.push('|---|---|---|---|---|---|---|---|');
  for (const r of [...resumenes].sort((a, b) => (a.inicio < b.inicio ? -1 : 1))) {
    L.push(
      `| ${r.sessionId.slice(0, 8)} | ${fmtDia(r.inicio)} | ${r.duracion} | ` +
      `${escTabla(limpiar(r.titulo) || '—')} | ${r.intercambios} | ${r.acciones} | ` +
      `${r.commits || '—'} | [${r.archivo}](${encodeURI(r.archivo)}) |`);
  }
  L.push('');
  const tot = resumenes.reduce((a, r) => ({
    i: a.i + r.intercambios, ac: a.ac + r.acciones, c: a.c + r.commits,
  }), { i: 0, ac: 0, c: 0 });
  L.push(`**Totales:** ${resumenes.length} sesiones · ${tot.i} intercambios · ${tot.ac} acciones · ${tot.c || '—'} commits`);
  L.push('');
  L.push(`_Generado por \`scripts/bitacora.mjs\` · última ejecución: ${fmtFecha(new Date().toISOString())} (COT)_`);
  return L.join('\n') + '\n';
}

// ────────────────────────────────────────────────────────────────── programa ──

function main() {
  const slug = slugProyecto(CFG.proyecto);
  const dirTranscripciones = path.join(os.homedir(), '.claude', 'projects', slug);

  if (!fs.existsSync(dirTranscripciones)) {
    console.error(`✗ No encuentro transcripciones en:\n  ${dirTranscripciones}`);
    console.error(`  (proyecto: ${CFG.proyecto})`);
    process.exit(1);
  }

  const rutaEstado = path.join(CFG.salida, '.estado.json');
  let estado = { version: 1, sesiones: {} };
  if (!CFG.rehacer && fs.existsSync(rutaEstado)) {
    try { estado = JSON.parse(fs.readFileSync(rutaEstado, 'utf8')); } catch { /* corrupto: se rehace */ }
  }

  const archivos = fs.readdirSync(dirTranscripciones)
    .filter((f) => f.endsWith('.jsonl'))
    .map((f) => path.join(dirTranscripciones, f));

  const nSecretos = cargarSecretosDelProyecto();

  console.log(`Transcripciones : ${dirTranscripciones}`);
  console.log(`Secretos locales: ${nSecretos} valores leídos de los .env (se redactan literalmente)`);
  console.log(`Salida          : ${CFG.salida}`);
  console.log(`Modo            : ${CFG.simulacion ? 'SIMULACIÓN (no escribe)' : 'escritura'}` +
    `${CFG.rehacer ? ' · rehacer todo' : ' · incremental'}` +
    `${CFG.todasLasSalidas ? ' · todas las salidas' : ' · salidas de comandos y errores'}` +
    `${CFG.redactarEmails ? ' · emails redactados' : ''}`);
  console.log('');

  const resumenes = [];
  let nuevos = 0, saltados = 0, bytesEscritos = 0;
  const ejemplos = [];

  for (const archivo of archivos) {
    const st = fs.statSync(archivo);
    const id = path.basename(archivo, '.jsonl');
    const prev = estado.sesiones[id];
    const sinCambios = prev && prev.bytes === st.size && prev.mtime === Math.round(st.mtimeMs);

    if (sinCambios && !CFG.rehacer) {
      resumenes.push(prev.resumen);
      saltados++;
      console.log(`  = ${id.slice(0, 8)}  sin cambios`);
      continue;
    }

    const s = analizarSesion(archivo);
    if (!s.intercambios.length) {
      console.log(`  · ${id.slice(0, 8)}  sin intercambios de usuario; se omite`);
      continue;
    }

    const md = generarMarkdown(s);
    const nombre = `${fmtDia(s.inicio)}-${id.slice(0, 8)}.md`;
    const destino = path.join(CFG.salida, nombre);

    const resumen = {
      sessionId: id,
      titulo: s.titulo,
      inicio: s.inicio,
      duracion: duracion(s.inicio, s.fin),
      intercambios: s.intercambios.length,
      acciones: s.intercambios.reduce((a, i) => a + i.acciones.length, 0),
      commits: s.intercambios.reduce((a, i) => a + i.commits.length, 0),
      archivo: nombre,
    };
    resumenes.push(resumen);
    estado.sesiones[id] = { bytes: st.size, mtime: Math.round(st.mtimeMs), lineas: s.lineas, resumen };

    nuevos++;
    bytesEscritos += Buffer.byteLength(md, 'utf8');
    console.log(`  ${prev ? '↻' : '+'} ${id.slice(0, 8)}  ${nombre}  ` +
      `${s.intercambios.length} interc · ${resumen.acciones} acciones · ` +
      `${(Buffer.byteLength(md, 'utf8') / 1024).toFixed(1)} KB`);

    if (!CFG.simulacion) {
      fs.mkdirSync(CFG.salida, { recursive: true });
      fs.writeFileSync(destino, md, 'utf8');
    } else if (ejemplos.length < 1) {
      ejemplos.push({ nombre, md });
    }
  }

  const indice = generarIndice(resumenes);
  bytesEscritos += Buffer.byteLength(indice, 'utf8');

  if (!CFG.simulacion) {
    fs.mkdirSync(CFG.salida, { recursive: true });
    fs.writeFileSync(path.join(CFG.salida, 'INDICE.md'), indice, 'utf8');
    fs.writeFileSync(rutaEstado, JSON.stringify(estado, null, 2), 'utf8');
  }

  console.log('');
  console.log(`Sesiones procesadas : ${nuevos}   sin cambios: ${saltados}`);
  console.log(`Tamaño total        : ${(bytesEscritos / 1024).toFixed(1)} KB`);
  const red = Object.entries(CONTADOR_REDACCIONES).sort((a, b) => b[1] - a[1]);
  console.log(`Redacciones         : ${red.reduce((a, [, n]) => a + n, 0)}`);
  for (const [k, n] of red) console.log(`   ${n.toString().padStart(5)}  ${k}`);

  if (CFG.simulacion && ejemplos.length) {
    console.log('\n' + '═'.repeat(72));
    console.log(`EJEMPLO (${ejemplos[0].nombre}) — primeras 60 líneas`);
    console.log('═'.repeat(72));
    console.log(ejemplos[0].md.split('\n').slice(0, 60).join('\n'));
    console.log('…');
  }
  if (CFG.simulacion) console.log('\nSimulación: no se escribió ningún archivo.');
}

main();
