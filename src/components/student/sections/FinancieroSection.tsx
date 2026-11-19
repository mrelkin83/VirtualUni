import React, { useState } from 'react';
import { formatearCop } from '../../../utils/formato';
import {
  DollarSign,
  CreditCard,
  Calendar,
  CheckCircle,
  AlertCircle,
  Download,
  Eye,
  X,
  Building2,
  Wallet,
  ArrowRight,
  Lock,
  Info
} from 'lucide-react';
import { Pago, Deuda, ResumenFinanciero } from '../../../types/student.types';
import { avisar } from '../../ui';

interface FinancieroSectionProps {
  historialPagos: Pago[];
  deudasPendientes: Deuda[];
  resumen: ResumenFinanciero;
  realizarPago?: (deudaId: number, metodoPago: string, datosPago: any) => void;
}

// Listado de bancos disponibles para PSE
const bancosPSE = [
  { id: '1', nombre: 'Bancolombia' },
  { id: '2', nombre: 'Banco de Bogotá' },
  { id: '3', nombre: 'Davivienda' },
  { id: '4', nombre: 'BBVA Colombia' },
  { id: '5', nombre: 'Banco de Occidente' },
  { id: '6', nombre: 'Banco Popular' },
  { id: '7', nombre: 'Banco AV Villas' },
  { id: '8', nombre: 'Banco Caja Social' },
  { id: '9', nombre: 'Scotiabank Colpatria' },
  { id: '10', nombre: 'Itaú' }
];

export const FinancieroSection: React.FC<FinancieroSectionProps> = ({
  historialPagos,
  deudasPendientes,
  resumen,
  realizarPago
}) => {
  const [detalleModal, setDetalleModal] = useState<Pago | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<'todos' | 'completado' | 'pendiente'>('todos');
  const [modalPago, setModalPago] = useState(false);
  const [deudaSeleccionada, setDeudaSeleccionada] = useState<Deuda | null>(null);
  const [metodoPagoSeleccionado, setMetodoPagoSeleccionado] = useState<'tarjeta' | 'pse' | 'efectivo' | 'transferencia' | null>(null);
  const [procesandoPago, setProcesandoPago] = useState(false);
  const [pagoExitoso, setPagoExitoso] = useState(false);

  // Estados para formulario de tarjeta
  const [datosTarjeta, setDatosTarjeta] = useState({
    numero: '',
    nombreTitular: '',
    fechaExpiracion: '',
    cvv: '',
    tipoDocumento: 'CC',
    numeroDocumento: '',
    email: '',
    telefono: ''
  });

  // Estados para PSE
  const [datosPSE, setDatosPSE] = useState({
    banco: '',
    tipoPersona: 'N', // N: Natural, J: Jurídica
    tipoDocumento: 'CC',
    numeroDocumento: '',
    email: '',
    telefono: ''
  });

  // Estados para efectivo
  const [puntoEfectivo, setPuntoEfectivo] = useState('');


  const pagosFiltrados = filtroEstado === 'todos'
    ? historialPagos
    : historialPagos.filter(p => p.estado === filtroEstado);

  const descargarComprobante = (pago: Pago) => {
    avisar.info(`Descargando comprobante: ${pago.comprobante}`);
  };

  const abrirModalPago = (deuda: Deuda) => {
    setDeudaSeleccionada(deuda);
    setModalPago(true);
    setMetodoPagoSeleccionado(null);
    setPagoExitoso(false);
  };

  const cerrarModalPago = () => {
    setModalPago(false);
    setDeudaSeleccionada(null);
    setMetodoPagoSeleccionado(null);
    setDatosTarjeta({
      numero: '',
      nombreTitular: '',
      fechaExpiracion: '',
      cvv: '',
      tipoDocumento: 'CC',
      numeroDocumento: '',
      email: '',
      telefono: ''
    });
    setDatosPSE({
      banco: '',
      tipoPersona: 'N',
      tipoDocumento: 'CC',
      numeroDocumento: '',
      email: '',
      telefono: ''
    });
    setPuntoEfectivo('');
  };

  const procesarPagoTarjeta = async () => {
    if (!datosTarjeta.numero || !datosTarjeta.nombreTitular || !datosTarjeta.fechaExpiracion || !datosTarjeta.cvv) {
      avisar.error('Por favor completa todos los campos de la tarjeta');
      return;
    }

    setProcesandoPago(true);

    // Simular procesamiento de pago
    setTimeout(() => {
      setProcesandoPago(false);
      setPagoExitoso(true);

      if (realizarPago && deudaSeleccionada) {
        realizarPago(deudaSeleccionada.id, 'Tarjeta de Crédito', datosTarjeta);
      }

      setTimeout(() => {
        cerrarModalPago();
      }, 3000);
    }, 2000);
  };

  const procesarPagoPSE = async () => {
    if (!datosPSE.banco || !datosPSE.numeroDocumento || !datosPSE.email) {
      avisar.error('Por favor completa todos los campos requeridos');
      return;
    }

    setProcesandoPago(true);

    // Simular redirección a banco
    setTimeout(() => {
      const bancoSeleccionado = bancosPSE.find(b => b.id === datosPSE.banco);

      avisar.error(`Redirigiendo a ${bancoSeleccionado?.nombre}...\n\nEn un entorno real, serías redirigido a la página del banco para completar el pago.`);

      // Simular confirmación del banco
      setTimeout(() => {
        setProcesandoPago(false);
        setPagoExitoso(true);

        if (realizarPago && deudaSeleccionada) {
          realizarPago(deudaSeleccionada.id, 'PSE', datosPSE);
        }

        setTimeout(() => {
          cerrarModalPago();
        }, 3000);
      }, 2000);
    }, 1500);
  };

  const procesarPagoEfectivo = () => {
    if (!puntoEfectivo) {
      avisar.info('Por favor selecciona un punto de pago');
      return;
    }

    setProcesandoPago(true);

    setTimeout(() => {
      setProcesandoPago(false);
      avisar.ok(`Código de pago generado exitosamente.\n\nPresenta este código en ${puntoEfectivo}:\n\nCódigo: ${Math.random().toString(36).substring(2, 15).toUpperCase()}\n\nVálido por 3 días`);
      cerrarModalPago();
    }, 1000);
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    setDatosTarjeta({ ...datosTarjeta, numero: formatted });
  };

  return (
    <div className="space-y-6">
      <h2 className={`text-2xl font-bold text-pn-ink`}>Estado de Cuenta</h2>

      {/* Resumen Financiero */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`bg-pn-surface rounded-lg shadow p-6 border-l-4 border-pn-ok`}>
          <div className="flex items-center gap-3">
            <div className="bg-pn-ok-soft p-3 rounded-full">
              <CheckCircle className="text-pn-ok" size={24} />
            </div>
            <div>
              <p className="text-sm text-pn-muted">Total Pagado</p>
              <p className={`text-2xl font-bold text-pn-ok`}>{formatearCop(resumen.totalPagado)}</p>
            </div>
          </div>
        </div>

        <div className={`bg-pn-surface rounded-lg shadow p-6 border-l-4 border-pn-warn`}>
          <div className="flex items-center gap-3">
            <div className="bg-pn-warn-soft p-3 rounded-full">
              <AlertCircle className="text-pn-warn" size={24} />
            </div>
            <div>
              <p className="text-sm text-pn-muted">Saldo Pendiente</p>
              <p className={`text-2xl font-bold text-pn-warn`}>{formatearCop(resumen.saldoPendiente)}</p>
            </div>
          </div>
        </div>

        <div className={`bg-pn-surface rounded-lg shadow p-6 border-l-4 border-pn-accent-line`}>
          <div className="flex items-center gap-3">
            <div className="bg-pn-accent-soft p-3 rounded-full">
              <Calendar className="text-pn-accent-text" size={24} />
            </div>
            <div>
              <p className="text-sm text-pn-muted">Próximo Vencimiento</p>
              <p className={`text-lg font-bold text-pn-accent-text`}>{resumen.proximoVencimiento}</p>
            </div>
          </div>
        </div>

        <div className={`bg-pn-surface rounded-lg shadow p-6 border-l-4 border-pn-accent-2`}>
          <div className="flex items-center gap-3">
            <div className="bg-pn-accent-2-soft p-3 rounded-full">
              <DollarSign className="text-pn-accent-2-text" size={24} />
            </div>
            <div>
              <p className="text-sm text-pn-muted">Último Pago</p>
              <p className={`text-2xl font-bold text-pn-accent-2-text`}>{formatearCop(resumen.ultimoPago)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Deudas Pendientes */}
      {deudasPendientes.length > 0 && (
        <div className={`bg-pn-surface rounded-lg shadow p-6`}>
          <h3 className={`text-lg font-bold text-pn-ink mb-4 flex items-center gap-2`}>
            <AlertCircle className="text-pn-warn" size={20} />
            Pagos Pendientes
          </h3>
          <div className="space-y-3">
            {deudasPendientes.map(deuda => (
              <div
                key={deuda.id}
                className={`border border-pn-line rounded-lg p-4 ${
                  deuda.estado === 'vencido'
                    ? 'border-l-4 border-pn-danger bg-pn-danger-soft'
                    : 'border-l-4 border-pn-warn'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className={`font-bold text-pn-ink`}>{deuda.concepto}</h4>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    deuda.estado === 'vencido'
                      ? 'bg-pn-danger-soft text-pn-danger'
                      : 'bg-pn-warn-soft text-pn-warn'
                  }`}>
                    {deuda.estado === 'vencido' ? 'Vencido' : 'Pendiente'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-2xl font-bold text-pn-ink`}>{formatearCop(deuda.monto)}</p>
                    <p className="text-sm text-pn-muted">Vence: {deuda.fechaVencimiento}</p>
                  </div>
                  <button
                    onClick={() => abrirModalPago(deuda)}
                    className="bg-pn-accent text-pn-accent-ink px-4 py-2 rounded hover:bg-pn-accent-hover flex items-center gap-2 transition"
                  >
                    <CreditCard size={16} />
                    Pagar Ahora
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Historial de Pagos */}
      <div className={`bg-pn-surface rounded-lg shadow`}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className={`text-lg font-bold text-pn-ink`}>Historial de Pagos</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setFiltroEstado('todos')}
                className={`px-3 py-1 rounded text-sm ${
                  filtroEstado === 'todos'
                    ? 'bg-pn-accent text-pn-accent-ink'
                    : `bg-pn-surface-3 text-pn-ink-2 hover:bg-pn-surface-3`
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setFiltroEstado('completado')}
                className={`px-3 py-1 rounded text-sm ${
                  filtroEstado === 'completado'
                    ? 'bg-pn-accent text-pn-accent-ink'
                    : `bg-pn-surface-3 text-pn-ink-2 hover:bg-pn-surface-3`
                }`}
              >
                Completados
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {pagosFiltrados.map(pago => (
              <div key={pago.id} className={`border border-pn-line rounded-lg p-4`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3 flex-1">
                    <div className={`p-2 rounded-full ${
                      pago.estado === 'completado'
                        ? 'bg-pn-ok-soft'
                        : 'bg-pn-warn-soft'
                    }`}>
                      {pago.estado === 'completado' ? (
                        <CheckCircle className="text-pn-ok" size={20} />
                      ) : (
                        <AlertCircle className="text-pn-warn" size={20} />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className={`font-bold text-pn-ink`}>{pago.concepto}</h4>
                      <p className="text-sm text-pn-muted">
                        {pago.fecha} • {pago.metodoPago}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-xl font-bold text-pn-ink`}>{formatearCop(pago.monto)}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      pago.estado === 'completado'
                        ? 'bg-pn-ok-soft text-pn-ok'
                        : 'bg-pn-warn-soft text-pn-warn'
                    }`}>
                      {pago.estado === 'completado' ? 'Pagado' : 'Pendiente'}
                    </span>
                  </div>
                </div>
                {pago.estado === 'completado' && (
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => setDetalleModal(pago)}
                      className="text-pn-accent-text hover:text-pn-accent-text text-sm flex items-center gap-1"
                    >
                      <Eye size={16} />
                      Ver detalle
                    </button>
                    <button
                      onClick={() => descargarComprobante(pago)}
                      className="text-pn-ok hover:text-pn-ok text-sm flex items-center gap-1"
                    >
                      <Download size={16} />
                      Descargar comprobante
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {pagosFiltrados.length === 0 && (
            <div className="text-center py-8">
              <p className="text-pn-muted">No hay pagos en esta categoría</p>
            </div>
          )}
        </div>
      </div>

      {/* Métodos de Pago Disponibles */}
      <div className={`bg-pn-surface rounded-lg shadow p-6`}>
        <h3 className={`text-lg font-bold text-pn-ink mb-4 flex items-center gap-2`}>
          <Info size={20} className="text-pn-accent-text" />
          Métodos de Pago Disponibles
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className={`border border-pn-line rounded-lg p-4 text-center hover:shadow-md transition cursor-pointer`}>
            <CreditCard className="mx-auto text-pn-accent-text mb-2" size={32} />
            <p className={`font-semibold text-pn-ink`}>Tarjeta de Crédito/Débito</p>
            <p className="text-sm text-pn-muted">Visa, Mastercard, Amex</p>
          </div>
          <div className={`border border-pn-line rounded-lg p-4 text-center hover:shadow-md transition cursor-pointer bg-pn-ok-soft border-pn-ok`}>
            <Building2 className="mx-auto text-pn-ok mb-2" size={32} />
            <p className={`font-semibold text-pn-ink`}>PSE</p>
            <p className="text-sm text-pn-muted">Pago en línea seguro</p>
            <span className="inline-block mt-2 px-2 py-1 bg-pn-ok-soft text-pn-ok text-xs rounded-full">
              Recomendado
            </span>
          </div>
          <div className={`border border-pn-line rounded-lg p-4 text-center hover:shadow-md transition cursor-pointer`}>
            <Wallet className="mx-auto text-pn-accent-2-text mb-2" size={32} />
            <p className={`font-semibold text-pn-ink`}>Efectivo</p>
            <p className="text-sm text-pn-muted">Puntos autorizados</p>
          </div>
          <div className={`border border-pn-line rounded-lg p-4 text-center hover:shadow-md transition cursor-pointer`}>
            <DollarSign className="mx-auto text-pn-warn mb-2" size={32} />
            <p className={`font-semibold text-pn-ink`}>Transferencia</p>
            <p className="text-sm text-pn-muted">Consignación bancaria</p>
          </div>
        </div>
      </div>

      {/* Modal de Detalle */}
      {detalleModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setDetalleModal(null)}
        >
          <div
            className={`bg-pn-surface rounded-lg max-w-md w-full p-6`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className={`text-xl font-bold text-pn-ink`}>Detalle del Pago</h3>
              <button
                onClick={() => setDetalleModal(null)}
                className="text-pn-muted hover:text-pn-ink-2"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-pn-muted">Concepto</p>
                <p className={`font-semibold text-pn-ink`}>{detalleModal.concepto}</p>
              </div>
              <div>
                <p className="text-sm text-pn-muted">Monto</p>
                <p className={`text-2xl font-bold text-pn-ok`}>{formatearCop(detalleModal.monto)}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-pn-muted">Fecha</p>
                  <p className={`font-semibold text-pn-ink`}>{detalleModal.fecha}</p>
                </div>
                <div>
                  <p className="text-sm text-pn-muted">Método de Pago</p>
                  <p className={`font-semibold text-pn-ink`}>{detalleModal.metodoPago}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-pn-muted">Comprobante</p>
                <p className={`font-semibold text-pn-ink`}>{detalleModal.comprobante}</p>
              </div>
              <div>
                <p className="text-sm text-pn-muted">Estado</p>
                <span className="inline-block px-3 py-1 bg-pn-ok-soft text-pn-ok rounded-full text-sm font-semibold">
                  Completado
                </span>
              </div>

              <button
                onClick={() => descargarComprobante(detalleModal)}
                className="w-full bg-pn-accent text-pn-accent-ink py-3 rounded hover:bg-pn-accent-hover font-semibold flex items-center justify-center gap-2"
              >
                <Download size={20} />
                Descargar Comprobante
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Pago */}
      {modalPago && deudaSeleccionada && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div role="dialog" aria-modal="true" aria-label="Realizar Pago" className={`bg-pn-surface rounded-lg max-w-2xl w-full p-6 my-8`}
            onClick={(e) => e.stopPropagation()}
          >
            {!pagoExitoso ? (
              <>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className={`text-xl font-bold text-pn-ink`}>Realizar Pago</h3>
                    <p className="text-sm text-pn-muted mt-1">
                      {deudaSeleccionada.concepto} - {formatearCop(deudaSeleccionada.monto)}
                    </p>
                  </div>
                  <button
                    onClick={cerrarModalPago}
                    className="text-pn-muted hover:text-pn-ink-2 p-2 -m-2 rounded"
                  >
                    <X size={24} />
                  </button>
                </div>

                {!metodoPagoSeleccionado ? (
                  <div className="space-y-4">
                    <p className={`font-medium text-pn-ink`}>Selecciona un método de pago:</p>

                    <button
                      onClick={() => setMetodoPagoSeleccionado('tarjeta')}
                      className={`w-full border border-pn-line rounded-lg p-4 hover:shadow-md transition text-left`}
                    >
                      <div className="flex items-center gap-3">
                        <CreditCard className="text-pn-accent-text" size={32} />
                        <div className="flex-1">
                          <p className={`font-semibold text-pn-ink`}>Tarjeta de Crédito/Débito</p>
                          <p className="text-sm text-pn-muted">Pago inmediato con tarjeta</p>
                        </div>
                        <ArrowRight size={20} className="text-pn-muted" />
                      </div>
                    </button>

                    <button
                      onClick={() => setMetodoPagoSeleccionado('pse')}
                      className={`w-full border-2 border-pn-ok rounded-lg p-4 hover:shadow-md transition text-left bg-pn-ok-soft`}
                    >
                      <div className="flex items-center gap-3">
                        <Building2 className="text-pn-ok" size={32} />
                        <div className="flex-1">
                          <p className={`font-semibold text-pn-ink flex items-center gap-2`}>
                            PSE - Pago Seguro en Línea
                            <span className="px-2 py-0.5 bg-pn-ok-soft text-pn-ok text-xs rounded-full">
                              Recomendado
                            </span>
                          </p>
                          <p className="text-sm text-pn-muted">Débito directo desde tu banco</p>
                        </div>
                        <ArrowRight size={20} className="text-pn-muted" />
                      </div>
                    </button>

                    <button
                      onClick={() => setMetodoPagoSeleccionado('efectivo')}
                      className={`w-full border border-pn-line rounded-lg p-4 hover:shadow-md transition text-left`}
                    >
                      <div className="flex items-center gap-3">
                        <Wallet className="text-pn-accent-2-text" size={32} />
                        <div className="flex-1">
                          <p className={`font-semibold text-pn-ink`}>Pago en Efectivo</p>
                          <p className="text-sm text-pn-muted">Genera código para puntos autorizados</p>
                        </div>
                        <ArrowRight size={20} className="text-pn-muted" />
                      </div>
                    </button>

                    <button
                      onClick={() => setMetodoPagoSeleccionado('transferencia')}
                      className={`w-full border border-pn-line rounded-lg p-4 hover:shadow-md transition text-left`}
                    >
                      <div className="flex items-center gap-3">
                        <DollarSign className="text-pn-warn" size={32} />
                        <div className="flex-1">
                          <p className={`font-semibold text-pn-ink`}>Transferencia Bancaria</p>
                          <p className="text-sm text-pn-muted">Consignación directa</p>
                        </div>
                        <ArrowRight size={20} className="text-pn-muted" />
                      </div>
                    </button>
                  </div>
                ) : metodoPagoSeleccionado === 'tarjeta' ? (
                  <div className="space-y-4">
                    <button
                      onClick={() => setMetodoPagoSeleccionado(null)}
                      className="text-pn-accent-text hover:text-pn-accent-text text-sm flex items-center gap-1 mb-2"
                    >
                      ← Volver a métodos de pago
                    </button>

                    <div className={`p-4 rounded-lg bg-pn-accent-soft flex items-start gap-2`}>
                      <Lock size={16} className="text-pn-accent-text mt-0.5" />
                      <p className="text-sm text-pn-accent-text">
                        Tus datos están protegidos con encriptación SSL
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className={`block text-sm font-medium mb-2 text-pn-ink`}>
                          Número de Tarjeta *
                        </label>
                        <input
                          type="text"
                          value={datosTarjeta.numero}
                          onChange={handleCardNumberChange}
                          maxLength={19}
                          placeholder="1234 5678 9012 3456"
                          className={`w-full px-3 py-2 rounded-lg border border-pn-line ${
                            'bg-pn-surface text-pn-ink'
                          } focus:outline-none focus:ring-2 focus:ring-pn-accent`}
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className={`block text-sm font-medium mb-2 text-pn-ink`}>
                          Nombre del Titular *
                        </label>
                        <input
                          type="text"
                          value={datosTarjeta.nombreTitular}
                          onChange={(e) => setDatosTarjeta({ ...datosTarjeta, nombreTitular: e.target.value.toUpperCase() })}
                          placeholder="NOMBRE COMO APARECE EN LA TARJETA"
                          className={`w-full px-3 py-2 rounded-lg border border-pn-line ${
                            'bg-pn-surface text-pn-ink'
                          } focus:outline-none focus:ring-2 focus:ring-pn-accent`}
                        />
                      </div>

                      <div>
                        <label className={`block text-sm font-medium mb-2 text-pn-ink`}>
                          Fecha de Expiración *
                        </label>
                        <input
                          type="text"
                          value={datosTarjeta.fechaExpiracion}
                          onChange={(e) => {
                            let value = e.target.value.replace(/\D/g, '');
                            if (value.length >= 2) {
                              value = value.slice(0, 2) + '/' + value.slice(2, 4);
                            }
                            setDatosTarjeta({ ...datosTarjeta, fechaExpiracion: value });
                          }}
                          maxLength={5}
                          placeholder="MM/AA"
                          className={`w-full px-3 py-2 rounded-lg border border-pn-line ${
                            'bg-pn-surface text-pn-ink'
                          } focus:outline-none focus:ring-2 focus:ring-pn-accent`}
                        />
                      </div>

                      <div>
                        <label className={`block text-sm font-medium mb-2 text-pn-ink`}>
                          CVV *
                        </label>
                        <input
                          type="text"
                          value={datosTarjeta.cvv}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '');
                            setDatosTarjeta({ ...datosTarjeta, cvv: value });
                          }}
                          maxLength={4}
                          placeholder="123"
                          className={`w-full px-3 py-2 rounded-lg border border-pn-line ${
                            'bg-pn-surface text-pn-ink'
                          } focus:outline-none focus:ring-2 focus:ring-pn-accent`}
                        />
                      </div>

                      <div>
                        <label className={`block text-sm font-medium mb-2 text-pn-ink`}>
                          Tipo de Documento *
                        </label>
                        <select
                          value={datosTarjeta.tipoDocumento}
                          onChange={(e) => setDatosTarjeta({ ...datosTarjeta, tipoDocumento: e.target.value })}
                          className={`w-full px-3 py-2 rounded-lg border border-pn-line ${
                            'bg-pn-surface text-pn-ink'
                          } focus:outline-none focus:ring-2 focus:ring-pn-accent`}
                        >
                          <option value="CC">Cédula de Ciudadanía</option>
                          <option value="CE">Cédula de Extranjería</option>
                          <option value="TI">Tarjeta de Identidad</option>
                          <option value="PAS">Pasaporte</option>
                        </select>
                      </div>

                      <div>
                        <label className={`block text-sm font-medium mb-2 text-pn-ink`}>
                          Número de Documento *
                        </label>
                        <input
                          type="text"
                          value={datosTarjeta.numeroDocumento}
                          onChange={(e) => setDatosTarjeta({ ...datosTarjeta, numeroDocumento: e.target.value })}
                          placeholder="1234567890"
                          className={`w-full px-3 py-2 rounded-lg border border-pn-line ${
                            'bg-pn-surface text-pn-ink'
                          } focus:outline-none focus:ring-2 focus:ring-pn-accent`}
                        />
                      </div>

                      <div>
                        <label className={`block text-sm font-medium mb-2 text-pn-ink`}>
                          Email *
                        </label>
                        <input
                          type="email"
                          value={datosTarjeta.email}
                          onChange={(e) => setDatosTarjeta({ ...datosTarjeta, email: e.target.value })}
                          placeholder="correo@ejemplo.com"
                          className={`w-full px-3 py-2 rounded-lg border border-pn-line ${
                            'bg-pn-surface text-pn-ink'
                          } focus:outline-none focus:ring-2 focus:ring-pn-accent`}
                        />
                      </div>

                      <div>
                        <label className={`block text-sm font-medium mb-2 text-pn-ink`}>
                          Teléfono *
                        </label>
                        <input
                          type="tel"
                          value={datosTarjeta.telefono}
                          onChange={(e) => setDatosTarjeta({ ...datosTarjeta, telefono: e.target.value })}
                          placeholder="3001234567"
                          className={`w-full px-3 py-2 rounded-lg border border-pn-line ${
                            'bg-pn-surface text-pn-ink'
                          } focus:outline-none focus:ring-2 focus:ring-pn-accent`}
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 mt-6">
                      <button
                        onClick={() => setMetodoPagoSeleccionado(null)}
                        className={`flex-1 px-4 py-3 rounded-lg border border-pn-line ${
                          'hover:bg-pn-surface-3'
                        } transition font-semibold`}
                        disabled={procesandoPago}
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={procesarPagoTarjeta}
                        disabled={procesandoPago}
                        className="flex-1 bg-pn-accent text-pn-accent-ink px-4 py-3 rounded-lg font-semibold hover:bg-pn-accent-hover transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {procesandoPago ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            Procesando...
                          </>
                        ) : (
                          <>
                            <Lock size={16} />
                            Pagar {formatearCop(deudaSeleccionada.monto)}
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ) : metodoPagoSeleccionado === 'pse' ? (
                  <div className="space-y-4">
                    <button
                      onClick={() => setMetodoPagoSeleccionado(null)}
                      className="text-pn-accent-text hover:text-pn-accent-text text-sm flex items-center gap-1 mb-2"
                    >
                      ← Volver a métodos de pago
                    </button>

                    <div className={`p-4 rounded-lg bg-pn-ok-soft flex items-start gap-2`}>
                      <Lock size={16} className="text-pn-ok mt-0.5" />
                      <div>
                        <p className="text-sm text-pn-ok font-semibold">
                          PSE - Pago Seguro en Línea
                        </p>
                        <p className="text-xs text-pn-ok mt-1">
                          Serás redirigido al portal de tu banco para completar el pago de forma segura
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className={`block text-sm font-medium mb-2 text-pn-ink`}>
                          Selecciona tu Banco *
                        </label>
                        <select
                          value={datosPSE.banco}
                          onChange={(e) => setDatosPSE({ ...datosPSE, banco: e.target.value })}
                          className={`w-full px-3 py-2 rounded-lg border border-pn-line ${
                            'bg-pn-surface text-pn-ink'
                          } focus:outline-none focus:ring-2 focus:ring-pn-ok`}
                        >
                          <option value="">Seleccionar banco...</option>
                          {bancosPSE.map(banco => (
                            <option key={banco.id} value={banco.id}>{banco.nombre}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className={`block text-sm font-medium mb-2 text-pn-ink`}>
                          Tipo de Persona *
                        </label>
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              value="N"
                              checked={datosPSE.tipoPersona === 'N'}
                              onChange={(e) => setDatosPSE({ ...datosPSE, tipoPersona: e.target.value })}
                              className="w-4 h-4"
                            />
                            <span className="text-pn-ink">Persona Natural</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              value="J"
                              checked={datosPSE.tipoPersona === 'J'}
                              onChange={(e) => setDatosPSE({ ...datosPSE, tipoPersona: e.target.value })}
                              className="w-4 h-4"
                            />
                            <span className="text-pn-ink">Persona Jurídica</span>
                          </label>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className={`block text-sm font-medium mb-2 text-pn-ink`}>
                            Tipo de Documento *
                          </label>
                          <select
                            value={datosPSE.tipoDocumento}
                            onChange={(e) => setDatosPSE({ ...datosPSE, tipoDocumento: e.target.value })}
                            className={`w-full px-3 py-2 rounded-lg border border-pn-line ${
                              'bg-pn-surface text-pn-ink'
                            } focus:outline-none focus:ring-2 focus:ring-pn-ok`}
                          >
                            <option value="CC">Cédula de Ciudadanía</option>
                            <option value="CE">Cédula de Extranjería</option>
                            <option value="NIT">NIT</option>
                            <option value="TI">Tarjeta de Identidad</option>
                            <option value="PAS">Pasaporte</option>
                          </select>
                        </div>

                        <div>
                          <label className={`block text-sm font-medium mb-2 text-pn-ink`}>
                            Número de Documento *
                          </label>
                          <input
                            type="text"
                            value={datosPSE.numeroDocumento}
                            onChange={(e) => setDatosPSE({ ...datosPSE, numeroDocumento: e.target.value })}
                            placeholder="1234567890"
                            className={`w-full px-3 py-2 rounded-lg border border-pn-line ${
                              'bg-pn-surface text-pn-ink'
                            } focus:outline-none focus:ring-2 focus:ring-pn-ok`}
                          />
                        </div>
                      </div>

                      <div>
                        <label className={`block text-sm font-medium mb-2 text-pn-ink`}>
                          Email *
                        </label>
                        <input
                          type="email"
                          value={datosPSE.email}
                          onChange={(e) => setDatosPSE({ ...datosPSE, email: e.target.value })}
                          placeholder="correo@ejemplo.com"
                          className={`w-full px-3 py-2 rounded-lg border border-pn-line ${
                            'bg-pn-surface text-pn-ink'
                          } focus:outline-none focus:ring-2 focus:ring-pn-ok`}
                        />
                      </div>

                      <div>
                        <label className={`block text-sm font-medium mb-2 text-pn-ink`}>
                          Teléfono *
                        </label>
                        <input
                          type="tel"
                          value={datosPSE.telefono}
                          onChange={(e) => setDatosPSE({ ...datosPSE, telefono: e.target.value })}
                          placeholder="3001234567"
                          className={`w-full px-3 py-2 rounded-lg border border-pn-line ${
                            'bg-pn-surface text-pn-ink'
                          } focus:outline-none focus:ring-2 focus:ring-pn-ok`}
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 mt-6">
                      <button
                        onClick={() => setMetodoPagoSeleccionado(null)}
                        className={`flex-1 px-4 py-3 rounded-lg border border-pn-line ${
                          'hover:bg-pn-surface-3'
                        } transition font-semibold`}
                        disabled={procesandoPago}
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={procesarPagoPSE}
                        disabled={procesandoPago}
                        className="flex-1 bg-pn-ok text-pn-surface px-4 py-3 rounded-lg font-semibold hover:bg-pn-ok transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {procesandoPago ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            Redirigiendo...
                          </>
                        ) : (
                          <>
                            <Building2 size={16} />
                            Continuar con PSE
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ) : metodoPagoSeleccionado === 'efectivo' ? (
                  <div className="space-y-4">
                    <button
                      onClick={() => setMetodoPagoSeleccionado(null)}
                      className="text-pn-accent-text hover:text-pn-accent-text text-sm flex items-center gap-1 mb-2"
                    >
                      ← Volver a métodos de pago
                    </button>

                    <div className={`p-4 rounded-lg bg-pn-info-soft`}>
                      <p className="text-sm text-pn-accent-2-text">
                        Genera un código de pago para realizar el pago en efectivo en puntos autorizados
                      </p>
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 text-pn-ink`}>
                        Selecciona el Punto de Pago *
                      </label>
                      <select
                        value={puntoEfectivo}
                        onChange={(e) => setPuntoEfectivo(e.target.value)}
                        className={`w-full px-3 py-2 rounded-lg border border-pn-line ${
                          'bg-pn-surface text-pn-ink'
                        } focus:outline-none focus:ring-2 focus:ring-pn-accent-2`}
                      >
                        <option value="">Seleccionar punto...</option>
                        <option value="Efecty">Efecty</option>
                        <option value="Baloto">Baloto</option>
                        <option value="Éxito">Éxito</option>
                        <option value="Carulla">Carulla</option>
                        <option value="SuperGiros">SuperGiros</option>
                      </select>
                    </div>

                    <div className={`p-4 rounded-lg border border-pn-line`}>
                      <p className={`font-semibold text-pn-ink mb-2`}>Información del Pago:</p>
                      <div className="space-y-1 text-sm">
                        <p><span className="text-pn-muted">Monto:</span> <span className="font-semibold">{formatearCop(deudaSeleccionada.monto)}</span></p>
                        <p><span className="text-pn-muted">Concepto:</span> {deudaSeleccionada.concepto}</p>
                        <p><span className="text-pn-muted">Vigencia del código:</span> 3 días</p>
                      </div>
                    </div>

                    <div className="flex gap-3 mt-6">
                      <button
                        onClick={() => setMetodoPagoSeleccionado(null)}
                        className={`flex-1 px-4 py-3 rounded-lg border border-pn-line ${
                          'hover:bg-pn-surface-3'
                        } transition font-semibold`}
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={procesarPagoEfectivo}
                        className="flex-1 bg-pn-accent-2 text-pn-accent-2-ink px-4 py-3 rounded-lg font-semibold hover:bg-pn-accent-2 transition flex items-center justify-center gap-2"
                      >
                        <Wallet size={16} />
                        Generar Código
                      </button>
                    </div>
                  </div>
                ) : metodoPagoSeleccionado === 'transferencia' ? (
                  <div className="space-y-4">
                    <button
                      onClick={() => setMetodoPagoSeleccionado(null)}
                      className="text-pn-accent-text hover:text-pn-accent-text text-sm flex items-center gap-1 mb-2"
                    >
                      ← Volver a métodos de pago
                    </button>

                    <div className={`p-4 rounded-lg bg-pn-warn-soft`}>
                      <p className={`font-semibold text-pn-ink mb-2`}>Datos Bancarios para Transferencia</p>
                      <p className="text-sm text-pn-warn">
                        Realiza la transferencia a la siguiente cuenta y envía el comprobante
                      </p>
                    </div>

                    <div className={`border border-pn-line rounded-lg p-4 space-y-3`}>
                      <div>
                        <p className="text-sm text-pn-muted">Banco</p>
                        <p className={`font-semibold text-pn-ink`}>Bancolombia</p>
                      </div>
                      <div>
                        <p className="text-sm text-pn-muted">Tipo de Cuenta</p>
                        <p className={`font-semibold text-pn-ink`}>Ahorros</p>
                      </div>
                      <div>
                        <p className="text-sm text-pn-muted">Número de Cuenta</p>
                        <p className={`font-semibold text-pn-ink text-lg`}>1234-5678-9012</p>
                      </div>
                      <div>
                        <p className="text-sm text-pn-muted">Titular</p>
                        <p className={`font-semibold text-pn-ink`}>Universidad Virtual UniVirtual</p>
                      </div>
                      <div>
                        <p className="text-sm text-pn-muted">NIT</p>
                        <p className={`font-semibold text-pn-ink`}>900.123.456-7</p>
                      </div>
                    </div>

                    <div className={`p-4 rounded-lg border border-pn-line`}>
                      <p className={`font-semibold text-pn-ink mb-2`}>Información del Pago:</p>
                      <div className="space-y-1 text-sm">
                        <p><span className="text-pn-muted">Monto a transferir:</span> <span className="font-semibold text-lg">{formatearCop(deudaSeleccionada.monto)}</span></p>
                        <p><span className="text-pn-muted">Concepto:</span> {deudaSeleccionada.concepto}</p>
                        <p><span className="text-pn-muted">Referencia:</span> <span className="font-mono">REF-{deudaSeleccionada.id}</span></p>
                      </div>
                    </div>

                    <div className={`p-3 rounded-lg bg-pn-warn-soft flex items-start gap-2`}>
                      <AlertCircle size={16} className="text-pn-warn mt-0.5" />
                      <p className="text-sm text-pn-warn">
                        Una vez realizada la transferencia, envía el comprobante al correo pagos@univirtual.edu.co o a través de la sección de trámites
                      </p>
                    </div>

                    <button
                      onClick={cerrarModalPago}
                      className="w-full bg-pn-warn text-pn-surface px-4 py-3 rounded-lg font-semibold hover:bg-pn-warn transition"
                    >
                      Entendido
                    </button>
                  </div>
                ) : null}
              </>
            ) : (
              <div className="text-center py-8">
                <div className="inline-block p-4 bg-pn-ok-soft rounded-full mb-4">
                  <CheckCircle className="text-pn-ok" size={64} />
                </div>
                <h3 className={`text-2xl font-bold text-pn-ink mb-2`}>¡Pago Exitoso!</h3>
                <p className="text-pn-muted mb-4">
                  Tu pago de {formatearCop(deudaSeleccionada.monto)} ha sido procesado correctamente
                </p>
                <div className="animate-pulse">
                  <p className="text-sm text-pn-muted">Cerrando...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
