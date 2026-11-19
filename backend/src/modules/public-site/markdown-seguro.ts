/**
 * Markdown mínimo para las páginas institucionales que escribe el admin.
 * Se ESCAPA TODO el HTML primero y solo después se convierten los patrones
 * permitidos (títulos, listas, negrita, cursiva, enlaces http/https), de modo
 * que ningún HTML del autor llega crudo al navegador. Sin dependencias: el
 * subconjunto es pequeño a propósito.
 */

const escapar = (s: string): string =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const enLinea = (s: string): string =>
  s
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>')
    .replace(
      /\[([^\]]+)\]\((https?:\/\/[^\s)]+|\/[^\s)]*)\)/g,
      (_m, texto: string, url: string) =>
        `<a href="${url}" class="enlace"${url.startsWith('/') ? '' : ' target="_blank" rel="noopener"'}>${texto}</a>`,
    );

export function markdownSeguro(fuente: string): string {
  const lineas = escapar(fuente.replace(/\r\n/g, '\n')).split('\n');
  const html: string[] = [];
  let parrafo: string[] = [];
  let enLista = false;

  const cerrarParrafo = () => {
    if (parrafo.length) {
      html.push(`<p>${enLinea(parrafo.join('<br />'))}</p>`);
      parrafo = [];
    }
  };
  const cerrarLista = () => {
    if (enLista) {
      html.push('</ul>');
      enLista = false;
    }
  };

  for (const cruda of lineas) {
    const linea = cruda.trimEnd();
    const h = linea.match(/^(#{2,4})\s+(.*)$/);
    const item = linea.match(/^[-*]\s+(.*)$/);

    if (!linea.trim()) {
      cerrarParrafo();
      cerrarLista();
    } else if (h) {
      cerrarParrafo();
      cerrarLista();
      const nivel = h[1].length; // ## → h2, ### → h3, #### → h4
      html.push(`<h${nivel}>${enLinea(h[2])}</h${nivel}>`);
    } else if (item) {
      cerrarParrafo();
      if (!enLista) {
        html.push('<ul>');
        enLista = true;
      }
      html.push(`<li>${enLinea(item[1])}</li>`);
    } else {
      cerrarLista();
      parrafo.push(linea);
    }
  }
  cerrarParrafo();
  cerrarLista();
  return html.join('\n');
}
