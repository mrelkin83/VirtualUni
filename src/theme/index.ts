export { ThemeProvider } from './ThemeProvider';

export {
  useTheme,
  leerTemaGuardado,
  guardarTema,
  resolverTema,
  CLAVE_TEMA,
  TEMA_POR_DEFECTO,
  type Tema,
  type TemaResuelto,
  type ValorTema,
} from './contexto';

export {
  aplicarAcento,
  calcularAcento,
  limpiarAcento,
  revisarColorDeMarca,
  type ResultadoAcento,
} from './aplicarAcento';

export {
  CONTRASTE_AA,
  CONTRASTE_AA_GRANDE,
  acentoLegible,
  aHex,
  luminanciaRelativa,
  mezclar,
  parsearHex,
  razonDeContraste,
  tintaSobre,
  type Rgb,
} from './color';
