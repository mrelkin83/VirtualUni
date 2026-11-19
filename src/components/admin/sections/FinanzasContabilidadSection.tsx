import React, { useState, useEffect } from 'react';
import { formatearCop } from '../../../utils/formato';
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  AlertCircle,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Wallet,
  PieChart,
  Calendar,
  X,
  Check,
  Clock,
  XCircle,
} from 'lucide-react';
import { financeApi, TransactionCreateDto } from '../../../api/endpoints/finance';
import { comoArreglo } from '../../../utils/respuestaApi';
import { confirmar } from '../../ui';

interface Transaction {
  id: string;
  codigo: string;
  tipo: 'INGRESO' | 'EGRESO';
  categoria: string;
  concepto: string;
  monto: number;
  fecha: string;
  metodoPago?: string;
  referencia?: string;
  estudiante?: string;
  descripcion?: string;
  comprobante?: string;
  estado: 'PENDIENTE' | 'COMPLETADO' | 'CANCELADO' | 'RECHAZADO';
  creadoPor: string;
  createdAt: string;
  updatedAt: string;
}

interface Account {
  id: string;
  codigo: string;
  nombre: string;
  tipo: string;
  balance: number;
  descripcion?: string;
  activa: boolean;
}

interface Budget {
  id: string;
  nombre: string;
  monto: number;
  montoGastado: number;
  categoria: string;
  fechaInicio: string;
  fechaFin: string;
  descripcion?: string;
}

interface FinanceStats {
  totalIngresos: number;
  totalEgresos: number;
  balance: number;
  totalTransacciones: number;
}

export const FinanzasContabilidadSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'transactions' | 'accounts' | 'budgets'>('transactions');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [stats, setStats] = useState<FinanceStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Form states
  const [transactionForm, setTransactionForm] = useState<TransactionCreateDto>({
    tipo: 'INGRESO',
    categoria: '',
    concepto: '',
    monto: 0,
    fecha: new Date().toISOString().split('T')[0],
    metodoPago: '',
    referencia: '',
    estudiante: '',
    descripcion: '',
    comprobante: '',
    estado: 'COMPLETADO',
    creadoPor: 'admin',
  });

  const [accountForm, setAccountForm] = useState({
    nombre: '',
    tipo: 'BANCO',
    balance: 0,
    descripcion: '',
    activa: true,
  });

  const [budgetForm, setBudgetForm] = useState({
    nombre: '',
    monto: 0,
    categoria: '',
    fechaInicio: new Date().toISOString().split('T')[0],
    fechaFin: new Date().toISOString().split('T')[0],
    descripcion: '',
  });

  useEffect(() => {
    loadStats();
    if (activeTab === 'transactions') {
      loadTransactions();
    } else if (activeTab === 'accounts') {
      loadAccounts();
    } else if (activeTab === 'budgets') {
      loadBudgets();
    }
  }, [activeTab, searchTerm]);

  const loadStats = async () => {
    try {
      const response = await financeApi.getTransactionStats();
      setStats((response as any).data || null);
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  const loadTransactions = async () => {
    try {
      setError(null);
      setLoading(true);
      const response = await financeApi.getAllTransactions({ search: searchTerm || undefined });
      setTransactions(comoArreglo(response));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar transacciones');
    } finally {
      setLoading(false);
    }
  };

  const loadAccounts = async () => {
    try {
      setError(null);
      setLoading(true);
      const response = await financeApi.getAllAccounts({ search: searchTerm || undefined });
      setAccounts(comoArreglo(response));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar cuentas');
    } finally {
      setLoading(false);
    }
  };

  const loadBudgets = async () => {
    try {
      setError(null);
      setLoading(true);
      const response = await financeApi.getAllBudgets({ search: searchTerm || undefined });
      setBudgets(comoArreglo(response));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar presupuestos');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenTransactionModal = (transaction?: Transaction) => {
    if (transaction) {
      setEditingId(transaction.id);
      setTransactionForm({
        tipo: transaction.tipo,
        categoria: transaction.categoria,
        concepto: transaction.concepto,
        monto: transaction.monto,
        fecha: transaction.fecha.split('T')[0],
        metodoPago: transaction.metodoPago || '',
        referencia: transaction.referencia || '',
        estudiante: transaction.estudiante || '',
        descripcion: transaction.descripcion || '',
        comprobante: transaction.comprobante || '',
        estado: transaction.estado,
        creadoPor: transaction.creadoPor,
      });
    } else {
      setEditingId(null);
      setTransactionForm({
        tipo: 'INGRESO',
        categoria: '',
        concepto: '',
        monto: 0,
        fecha: new Date().toISOString().split('T')[0],
        metodoPago: '',
        referencia: '',
        estudiante: '',
        descripcion: '',
        comprobante: '',
        estado: 'COMPLETADO',
        creadoPor: 'admin',
      });
    }
    setShowModal(true);
  };

  const handleSubmitTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (editingId) {
        await financeApi.updateTransaction(editingId, transactionForm);
      } else {
        await financeApi.createTransaction(transactionForm);
      }
      setShowModal(false);
      loadTransactions();
      loadStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar transacción');
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!await confirmar('¿Estás seguro de eliminar esta transacción?')) return;
    try {
      await financeApi.deleteTransaction(id);
      loadTransactions();
      loadStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar transacción');
    }
  };

  const handleOpenAccountModal = (account?: Account) => {
    if (account) {
      setEditingId(account.id);
      setAccountForm({
        nombre: account.nombre,
        tipo: account.tipo,
        balance: account.balance,
        descripcion: account.descripcion || '',
        activa: account.activa,
      });
    } else {
      setEditingId(null);
      setAccountForm({
        nombre: '',
        tipo: 'BANCO',
        balance: 0,
        descripcion: '',
        activa: true,
      });
    }
    setShowModal(true);
  };

  const handleSubmitAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (editingId) {
        await financeApi.updateAccount(editingId, accountForm);
      } else {
        await financeApi.createAccount(accountForm);
      }
      setShowModal(false);
      loadAccounts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar cuenta');
    }
  };

  const handleDeleteAccount = async (id: string) => {
    if (!await confirmar('¿Estás seguro de eliminar esta cuenta?')) return;
    try {
      await financeApi.deleteAccount(id);
      loadAccounts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar cuenta');
    }
  };

  const handleOpenBudgetModal = (budget?: Budget) => {
    if (budget) {
      setEditingId(budget.id);
      setBudgetForm({
        nombre: budget.nombre,
        monto: budget.monto,
        categoria: budget.categoria,
        fechaInicio: budget.fechaInicio.split('T')[0],
        fechaFin: budget.fechaFin.split('T')[0],
        descripcion: budget.descripcion || '',
      });
    } else {
      setEditingId(null);
      setBudgetForm({
        nombre: '',
        monto: 0,
        categoria: '',
        fechaInicio: new Date().toISOString().split('T')[0],
        fechaFin: new Date().toISOString().split('T')[0],
        descripcion: '',
      });
    }
    setShowModal(true);
  };

  const handleSubmitBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (editingId) {
        await financeApi.updateBudget(editingId, budgetForm);
      } else {
        await financeApi.createBudget(budgetForm);
      }
      setShowModal(false);
      loadBudgets();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar presupuesto');
    }
  };

  const handleDeleteBudget = async (id: string) => {
    if (!await confirmar('¿Estás seguro de eliminar este presupuesto?')) return;
    try {
      await financeApi.deleteBudget(id);
      loadBudgets();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar presupuesto');
    }
  };


  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETADO':
        return <Check className="w-4 h-4 text-pn-ok" />;
      case 'PENDIENTE':
        return <Clock className="w-4 h-4 text-pn-warn" />;
      case 'CANCELADO':
      case 'RECHAZADO':
        return <XCircle className="w-4 h-4 text-pn-danger" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETADO':
        return 'bg-pn-ok-soft text-pn-ok';
      case 'PENDIENTE':
        return 'bg-pn-warn-soft text-pn-warn';
      case 'CANCELADO':
      case 'RECHAZADO':
        return 'bg-pn-danger-soft text-pn-danger';
      default:
        return 'bg-pn-surface-3 text-pn-ink';
    }
  };

  return (
    <div className="p-6">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-pn-ok-soft rounded-lg p-6 border border-pn-ok">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-pn-ok">Total Ingresos</span>
              <TrendingUp className="w-5 h-5 text-pn-ok" />
            </div>
            <div className="text-2xl font-bold text-pn-ok">{formatearCop(stats.totalIngresos)}</div>
          </div>

          <div className="bg-pn-danger-soft rounded-lg p-6 border border-pn-danger">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-pn-danger">Total Egresos</span>
              <TrendingDown className="w-5 h-5 text-pn-danger" />
            </div>
            <div className="text-2xl font-bold text-pn-danger">{formatearCop(stats.totalEgresos)}</div>
          </div>

          <div className="bg-pn-accent-soft rounded-lg p-6 border border-pn-accent-line">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-pn-accent-text">Balance</span>
              <Wallet className="w-5 h-5 text-pn-accent-text" />
            </div>
            <div className="text-2xl font-bold text-pn-accent-text">{formatearCop(stats.balance)}</div>
          </div>

          <div className="bg-pn-accent-2-soft rounded-lg p-6 border border-pn-accent-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-pn-accent-2-text">Transacciones</span>
              <PieChart className="w-5 h-5 text-pn-accent-2-text" />
            </div>
            <div className="text-2xl font-bold text-pn-accent-2-text">{stats.totalTransacciones}</div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-pn-surface rounded-lg shadow-sm border border-pn-line mb-6">
        <div className="border-b border-pn-line">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('transactions')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition ${
                activeTab === 'transactions'
                  ? 'border-pn-accent-line text-pn-accent-text'
                  : 'border-transparent text-pn-muted hover:text-pn-ink-2 hover:border-pn-line'
              }`}
            >
              <DollarSign className="w-4 h-4 inline mr-2" />
              Transacciones
            </button>
            <button
              onClick={() => setActiveTab('accounts')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition ${
                activeTab === 'accounts'
                  ? 'border-pn-accent-line text-pn-accent-text'
                  : 'border-transparent text-pn-muted hover:text-pn-ink-2 hover:border-pn-line'
              }`}
            >
              <Wallet className="w-4 h-4 inline mr-2" />
              Cuentas
            </button>
            <button
              onClick={() => setActiveTab('budgets')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition ${
                activeTab === 'budgets'
                  ? 'border-pn-accent-line text-pn-accent-text'
                  : 'border-transparent text-pn-muted hover:text-pn-ink-2 hover:border-pn-line'
              }`}
            >
              <PieChart className="w-4 h-4 inline mr-2" />
              Presupuestos
            </button>
          </nav>
        </div>

        {/* Search and Actions */}
        <div className="p-4 flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-pn-muted" />
            <input
              type="text"
              placeholder={`Buscar ${activeTab === 'transactions' ? 'transacciones' : activeTab === 'accounts' ? 'cuentas' : 'presupuestos'}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-pn-line rounded-lg focus:ring-2 focus:ring-pn-accent focus:border-transparent"
            />
          </div>
          <button
            onClick={() => {
              if (activeTab === 'transactions') handleOpenTransactionModal();
              else if (activeTab === 'accounts') handleOpenAccountModal();
              else handleOpenBudgetModal();
            }}
            className="flex items-center gap-2 px-4 py-2 bg-pn-accent text-pn-accent-ink rounded-lg hover:bg-pn-accent-hover transition"
          >
            <Plus className="w-5 h-5" />
            {activeTab === 'transactions' ? 'Nueva Transacción' : activeTab === 'accounts' ? 'Nueva Cuenta' : 'Nuevo Presupuesto'}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-4 mb-4 flex items-center gap-3 p-4 bg-pn-danger-soft border border-pn-danger rounded-lg text-pn-danger">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Content */}
        <div className="p-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-pn-accent-line"></div>
              <p className="text-pn-ink-2 mt-2">Cargando...</p>
            </div>
          ) : (
            <>
              {/* Transactions Tab */}
              {activeTab === 'transactions' && (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-pn-line">
                    <thead className="bg-pn-surface-2">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-pn-muted uppercase tracking-wider">
                          Código
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-pn-muted uppercase tracking-wider">
                          Tipo
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-pn-muted uppercase tracking-wider">
                          Categoría
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-pn-muted uppercase tracking-wider">
                          Concepto
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-pn-muted uppercase tracking-wider">
                          Monto
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-pn-muted uppercase tracking-wider">
                          Fecha
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-pn-muted uppercase tracking-wider">
                          Estado
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-pn-muted uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-pn-surface divide-y divide-pn-line">
                      {transactions.map((transaction) => (
                        <tr key={transaction.id} className="hover:bg-pn-surface-2">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-pn-ink">
                            {transaction.codigo}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                transaction.tipo === 'INGRESO'
                                  ? 'bg-pn-ok-soft text-pn-ok'
                                  : 'bg-pn-danger-soft text-pn-danger'
                              }`}
                            >
                              {transaction.tipo}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-pn-ink">
                            {transaction.categoria}
                          </td>
                          <td className="px-6 py-4 text-sm text-pn-ink">{transaction.concepto}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-pn-ink">
                            {formatearCop(transaction.monto)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-pn-muted">
                            {new Date(transaction.fecha).toLocaleDateString('es-CO')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                transaction.estado
                              )}`}
                            >
                              {getStatusIcon(transaction.estado)}
                              {transaction.estado}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-pn-muted">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleOpenTransactionModal(transaction)}
                                className="text-pn-accent-text hover:text-pn-accent-text"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteTransaction(transaction.id)}
                                className="text-pn-danger hover:text-pn-danger"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {transactions.length === 0 && (
                    <div className="text-center py-12 text-pn-muted">
                      No hay transacciones registradas
                    </div>
                  )}
                </div>
              )}

              {/* Accounts Tab */}
              {activeTab === 'accounts' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {accounts.map((account) => (
                    <div
                      key={account.id}
                      className="bg-pn-surface border border-pn-line rounded-lg p-6 hover:shadow-lg transition"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-pn-ink">{account.nombre}</h3>
                          <p className="text-sm text-pn-muted">{account.codigo}</p>
                        </div>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            account.activa ? 'bg-pn-ok-soft text-pn-ok' : 'bg-pn-surface-3 text-pn-ink'
                          }`}
                        >
                          {account.activa ? 'Activa' : 'Inactiva'}
                        </span>
                      </div>
                      <div className="mb-4">
                        <p className="text-sm text-pn-ink-2 mb-1">Balance</p>
                        <p className="text-2xl font-bold text-pn-ink">{formatearCop(account.balance)}</p>
                      </div>
                      <p className="text-sm text-pn-ink-2 mb-4">{account.descripcion}</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleOpenAccountModal(account)}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-pn-accent-soft text-pn-accent-text rounded hover:bg-pn-accent-soft transition"
                        >
                          <Edit2 className="w-4 h-4" />
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteAccount(account.id)}
                          className="flex items-center justify-center px-3 py-2 bg-pn-danger-soft text-pn-danger rounded hover:bg-pn-danger-soft transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {accounts.length === 0 && (
                    <div className="col-span-full text-center py-12 text-pn-muted">
                      No hay cuentas registradas
                    </div>
                  )}
                </div>
              )}

              {/* Budgets Tab */}
              {activeTab === 'budgets' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {budgets.map((budget) => {
                    const percentage = (budget.montoGastado / budget.monto) * 100;
                    return (
                      <div
                        key={budget.id}
                        className="bg-pn-surface border border-pn-line rounded-lg p-6 hover:shadow-lg transition"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-pn-ink">{budget.nombre}</h3>
                            <p className="text-sm text-pn-muted">{budget.categoria}</p>
                          </div>
                        </div>
                        <div className="mb-4">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-pn-ink-2">Gastado</span>
                            <span className="font-medium text-pn-ink">
                              {formatearCop(budget.montoGastado)} / {formatearCop(budget.monto)}
                            </span>
                          </div>
                          <div className="w-full bg-pn-surface-3 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                percentage >= 90
                                  ? 'bg-pn-danger'
                                  : percentage >= 70
                                  ? 'bg-pn-warn'
                                  : 'bg-pn-ok'
                              }`}
                              style={{ width: `${Math.min(percentage, 100)}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-pn-muted mt-1">{percentage.toFixed(1)}% utilizado</p>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-pn-ink-2 mb-4">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {new Date(budget.fechaInicio).toLocaleDateString('es-CO')} -{' '}
                            {new Date(budget.fechaFin).toLocaleDateString('es-CO')}
                          </span>
                        </div>
                        {budget.descripcion && (
                          <p className="text-sm text-pn-ink-2 mb-4">{budget.descripcion}</p>
                        )}
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleOpenBudgetModal(budget)}
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-pn-accent-soft text-pn-accent-text rounded hover:bg-pn-accent-soft transition"
                          >
                            <Edit2 className="w-4 h-4" />
                            Editar
                          </button>
                          <button
                            onClick={() => handleDeleteBudget(budget.id)}
                            className="flex items-center justify-center px-3 py-2 bg-pn-danger-soft text-pn-danger rounded hover:bg-pn-danger-soft transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  {budgets.length === 0 && (
                    <div className="col-span-full text-center py-12 text-pn-muted">
                      No hay presupuestos registrados
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal for Transaction */}
      {showModal && activeTab === 'transactions' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div role="dialog" aria-modal="true" aria-label="{editingId ? 'Editar Transacción' : 'Nueva Transacción'}" className="bg-pn-surface rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-pn-surface border-b border-pn-line px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-pn-ink">
                {editingId ? 'Editar Transacción' : 'Nueva Transacción'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-pn-muted hover:text-pn-ink-2">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitTransaction} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-pn-ink-2 mb-1">Tipo *</label>
                  <select
                    value={transactionForm.tipo}
                    onChange={(e) =>
                      setTransactionForm({ ...transactionForm, tipo: e.target.value as 'INGRESO' | 'EGRESO' })
                    }
                    className="w-full px-3 py-2 border border-pn-line rounded-lg focus:ring-2 focus:ring-pn-accent"
                    required
                  >
                    <option value="INGRESO">Ingreso</option>
                    <option value="EGRESO">Egreso</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-pn-ink-2 mb-1">Estado *</label>
                  <select
                    value={transactionForm.estado}
                    onChange={(e) =>
                      setTransactionForm({
                        ...transactionForm,
                        estado: e.target.value as 'PENDIENTE' | 'COMPLETADO' | 'CANCELADO' | 'RECHAZADO',
                      })
                    }
                    className="w-full px-3 py-2 border border-pn-line rounded-lg focus:ring-2 focus:ring-pn-accent"
                    required
                  >
                    <option value="COMPLETADO">Completado</option>
                    <option value="PENDIENTE">Pendiente</option>
                    <option value="CANCELADO">Cancelado</option>
                    <option value="RECHAZADO">Rechazado</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-pn-ink-2 mb-1">Categoría *</label>
                  <input
                    type="text"
                    value={transactionForm.categoria}
                    onChange={(e) => setTransactionForm({ ...transactionForm, categoria: e.target.value })}
                    className="w-full px-3 py-2 border border-pn-line rounded-lg focus:ring-2 focus:ring-pn-accent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-pn-ink-2 mb-1">Monto *</label>
                  <input
                    type="number"
                    value={transactionForm.monto}
                    onChange={(e) => setTransactionForm({ ...transactionForm, monto: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-pn-line rounded-lg focus:ring-2 focus:ring-pn-accent"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-pn-ink-2 mb-1">Concepto *</label>
                <input
                  type="text"
                  value={transactionForm.concepto}
                  onChange={(e) => setTransactionForm({ ...transactionForm, concepto: e.target.value })}
                  className="w-full px-3 py-2 border border-pn-line rounded-lg focus:ring-2 focus:ring-pn-accent"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-pn-ink-2 mb-1">Fecha *</label>
                  <input
                    type="date"
                    value={transactionForm.fecha}
                    onChange={(e) => setTransactionForm({ ...transactionForm, fecha: e.target.value })}
                    className="w-full px-3 py-2 border border-pn-line rounded-lg focus:ring-2 focus:ring-pn-accent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-pn-ink-2 mb-1">Método de Pago</label>
                  <input
                    type="text"
                    value={transactionForm.metodoPago}
                    onChange={(e) => setTransactionForm({ ...transactionForm, metodoPago: e.target.value })}
                    className="w-full px-3 py-2 border border-pn-line rounded-lg focus:ring-2 focus:ring-pn-accent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-pn-ink-2 mb-1">Referencia</label>
                  <input
                    type="text"
                    value={transactionForm.referencia}
                    onChange={(e) => setTransactionForm({ ...transactionForm, referencia: e.target.value })}
                    className="w-full px-3 py-2 border border-pn-line rounded-lg focus:ring-2 focus:ring-pn-accent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-pn-ink-2 mb-1">Estudiante</label>
                  <input
                    type="text"
                    value={transactionForm.estudiante}
                    onChange={(e) => setTransactionForm({ ...transactionForm, estudiante: e.target.value })}
                    className="w-full px-3 py-2 border border-pn-line rounded-lg focus:ring-2 focus:ring-pn-accent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-pn-ink-2 mb-1">Descripción</label>
                <textarea
                  value={transactionForm.descripcion}
                  onChange={(e) => setTransactionForm({ ...transactionForm, descripcion: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-pn-line rounded-lg focus:ring-2 focus:ring-pn-accent"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-pn-line text-pn-ink-2 rounded-lg hover:bg-pn-surface-2 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-pn-accent text-pn-accent-ink rounded-lg hover:bg-pn-accent-hover transition"
                >
                  {editingId ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal for Account */}
      {showModal && activeTab === 'accounts' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div role="dialog" aria-modal="true" aria-label="{editingId ? 'Editar Cuenta' : 'Nueva Cuenta'}" className="bg-pn-surface rounded-lg max-w-lg w-full">
            <div className="border-b border-pn-line px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-pn-ink">
                {editingId ? 'Editar Cuenta' : 'Nueva Cuenta'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-pn-muted hover:text-pn-ink-2">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitAccount} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-pn-ink-2 mb-1">Nombre *</label>
                <input
                  type="text"
                  value={accountForm.nombre}
                  onChange={(e) => setAccountForm({ ...accountForm, nombre: e.target.value })}
                  className="w-full px-3 py-2 border border-pn-line rounded-lg focus:ring-2 focus:ring-pn-accent"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-pn-ink-2 mb-1">Tipo *</label>
                  <select
                    value={accountForm.tipo}
                    onChange={(e) => setAccountForm({ ...accountForm, tipo: e.target.value })}
                    className="w-full px-3 py-2 border border-pn-line rounded-lg focus:ring-2 focus:ring-pn-accent"
                    required
                  >
                    <option value="BANCO">Banco</option>
                    <option value="CAJA">Caja</option>
                    <option value="AHORRO">Ahorro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-pn-ink-2 mb-1">Balance Inicial *</label>
                  <input
                    type="number"
                    value={accountForm.balance}
                    onChange={(e) => setAccountForm({ ...accountForm, balance: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-pn-line rounded-lg focus:ring-2 focus:ring-pn-accent"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-pn-ink-2 mb-1">Descripción</label>
                <textarea
                  value={accountForm.descripcion}
                  onChange={(e) => setAccountForm({ ...accountForm, descripcion: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-pn-line rounded-lg focus:ring-2 focus:ring-pn-accent"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="activa"
                  checked={accountForm.activa}
                  onChange={(e) => setAccountForm({ ...accountForm, activa: e.target.checked })}
                  className="w-4 h-4 text-pn-accent-text border-pn-line rounded focus:ring-pn-accent"
                />
                <label htmlFor="activa" className="text-sm text-pn-ink-2">
                  Cuenta Activa
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-pn-line text-pn-ink-2 rounded-lg hover:bg-pn-surface-2 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-pn-accent text-pn-accent-ink rounded-lg hover:bg-pn-accent-hover transition"
                >
                  {editingId ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal for Budget */}
      {showModal && activeTab === 'budgets' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div role="dialog" aria-modal="true" aria-label="{editingId ? 'Editar Presupuesto' : 'Nuevo Presupuesto'}" className="bg-pn-surface rounded-lg max-w-lg w-full">
            <div className="border-b border-pn-line px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-pn-ink">
                {editingId ? 'Editar Presupuesto' : 'Nuevo Presupuesto'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-pn-muted hover:text-pn-ink-2">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitBudget} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-pn-ink-2 mb-1">Nombre *</label>
                <input
                  type="text"
                  value={budgetForm.nombre}
                  onChange={(e) => setBudgetForm({ ...budgetForm, nombre: e.target.value })}
                  className="w-full px-3 py-2 border border-pn-line rounded-lg focus:ring-2 focus:ring-pn-accent"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-pn-ink-2 mb-1">Categoría *</label>
                  <input
                    type="text"
                    value={budgetForm.categoria}
                    onChange={(e) => setBudgetForm({ ...budgetForm, categoria: e.target.value })}
                    className="w-full px-3 py-2 border border-pn-line rounded-lg focus:ring-2 focus:ring-pn-accent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-pn-ink-2 mb-1">Monto *</label>
                  <input
                    type="number"
                    value={budgetForm.monto}
                    onChange={(e) => setBudgetForm({ ...budgetForm, monto: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-pn-line rounded-lg focus:ring-2 focus:ring-pn-accent"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-pn-ink-2 mb-1">Fecha Inicio *</label>
                  <input
                    type="date"
                    value={budgetForm.fechaInicio}
                    onChange={(e) => setBudgetForm({ ...budgetForm, fechaInicio: e.target.value })}
                    className="w-full px-3 py-2 border border-pn-line rounded-lg focus:ring-2 focus:ring-pn-accent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-pn-ink-2 mb-1">Fecha Fin *</label>
                  <input
                    type="date"
                    value={budgetForm.fechaFin}
                    onChange={(e) => setBudgetForm({ ...budgetForm, fechaFin: e.target.value })}
                    className="w-full px-3 py-2 border border-pn-line rounded-lg focus:ring-2 focus:ring-pn-accent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-pn-ink-2 mb-1">Descripción</label>
                <textarea
                  value={budgetForm.descripcion}
                  onChange={(e) => setBudgetForm({ ...budgetForm, descripcion: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-pn-line rounded-lg focus:ring-2 focus:ring-pn-accent"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-pn-line text-pn-ink-2 rounded-lg hover:bg-pn-surface-2 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-pn-accent text-pn-accent-ink rounded-lg hover:bg-pn-accent-hover transition"
                >
                  {editingId ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
