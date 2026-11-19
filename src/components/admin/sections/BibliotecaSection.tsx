import React, { useState, useMemo } from 'react';
import { avisar, confirmar } from '../../ui';
import {
  BookOpen, Search, Plus, Edit, Trash2, Eye, X, Save,
  Calendar, User, CheckCircle, XCircle, AlertCircle, Filter,
  TrendingUp, Clock, Book
} from 'lucide-react';

interface Libro {
  id: number;
  titulo: string;
  autor: string;
  isbn: string;
  editorial: string;
  categoria: string;
  cantidadTotal: number;
  cantidadDisponible: number;
  estado: string;
  descripcion?: string;
}

interface Prestamo {
  id: number;
  libroTitulo: string;
  libroAutor?: string;
  usuarioNombre: string;
  usuarioId?: number;
  fechaPrestamo: string;
  fechaDevolucionEsperada: string;
  estado?: string;
  diasRestantes?: number;
}

export const BibliotecaSection: React.FC = () => {
  // Theme classes
  const input = 'bg-pn-surface text-pn-ink border-pn-line-strong';

  // Mock data (initially empty, will be loaded from API)
  const [libros, setLibros] = useState<Libro[]>([
    {
      id: 1,
      titulo: 'Cálculo Diferencial e Integral',
      autor: 'James Stewart',
      isbn: '978-6074817188',
      editorial: 'Cengage Learning',
      categoria: 'Matemáticas',
      cantidadTotal: 5,
      cantidadDisponible: 3,
      estado: 'disponible',
      descripcion: 'Texto fundamental de cálculo para ingeniería'
    },
    {
      id: 2,
      titulo: 'Introducción a la Programación',
      autor: 'Deitel & Deitel',
      isbn: '978-6073221313',
      editorial: 'Pearson',
      categoria: 'Programación',
      cantidadTotal: 8,
      cantidadDisponible: 0,
      estado: 'prestado',
      descripcion: 'Fundamentos de programación en C++'
    }
  ]);

  const [prestamos, setPrestamos] = useState<Prestamo[]>([
    {
      id: 1,
      libroTitulo: 'Introducción a la Programación',
      libroAutor: 'Deitel & Deitel',
      usuarioNombre: 'Juan Pérez',
      usuarioId: 101,
      fechaPrestamo: '2024-01-15',
      fechaDevolucionEsperada: '2024-02-15',
      estado: 'activo',
      diasRestantes: 10
    }
  ]);

  // State
  const [activeTab, setActiveTab] = useState<'catalogo' | 'prestamos'>('catalogo');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');

  // Modals
  const [modalNuevoLibro, setModalNuevoLibro] = useState(false);
  const [modalEditarLibro, setModalEditarLibro] = useState(false);
  const [modalDetalleLibro, setModalDetalleLibro] = useState(false);
  const [modalNuevoPrestamo, setModalNuevoPrestamo] = useState(false);
  const [modalDevolucion, setModalDevolucion] = useState(false);

  // Selected items
  const [libroSeleccionado, setLibroSeleccionado] = useState<Libro | null>(null);
  const [prestamoSeleccionado, setPrestamoSeleccionado] = useState<Prestamo | null>(null);

  // Forms
  const [nuevoLibroForm, setNuevoLibroForm] = useState({
    titulo: '',
    autor: '',
    isbn: '',
    editorial: '',
    categoria: '',
    cantidadTotal: 1,
    cantidadDisponible: 1,
    descripcion: ''
  });

  const [nuevoPrestamoForm, setNuevoPrestamoForm] = useState({
    libroId: 0,
    usuarioId: '',
    usuarioNombre: '',
    fechaDevolucion: ''
  });

  // Get unique categories
  const categories = useMemo(() => {
    const uniqueCategories = new Set(libros.map(libro => libro.categoria));
    return Array.from(uniqueCategories);
  }, [libros]);

  // Filter books
  const filteredLibros = useMemo(() => {
    return libros.filter(libro => {
      const matchesSearch =
        libro.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        libro.autor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        libro.isbn.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = selectedCategory === 'Todas' || libro.categoria === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [libros, searchTerm, selectedCategory]);

  // Statistics
  const stats = useMemo(() => ({
    totalLibros: libros.length,
    totalCopias: libros.reduce((sum, l) => sum + l.cantidadTotal, 0),
    copiasDisponibles: libros.reduce((sum, l) => sum + l.cantidadDisponible, 0),
    prestamosActivos: prestamos.filter(p => p.estado === 'activo').length,
    prestamosVencidos: prestamos.filter(p => p.estado === 'vencido').length
  }), [libros, prestamos]);

  // Handlers
  const handleCrearLibro = () => {
    const nuevoLibro: Libro = {
      id: libros.length + 1,
      ...nuevoLibroForm,
      estado: nuevoLibroForm.cantidadDisponible > 0 ? 'disponible' : 'prestado'
    };
    setLibros([...libros, nuevoLibro]);
    setModalNuevoLibro(false);
    setNuevoLibroForm({
      titulo: '',
      autor: '',
      isbn: '',
      editorial: '',
      categoria: '',
      cantidadTotal: 1,
      cantidadDisponible: 1,
      descripcion: ''
    });
  };

  const handleEditarLibro = () => {
    if (!libroSeleccionado) return;
    setLibros(libros.map(l => l.id === libroSeleccionado.id ? libroSeleccionado : l));
    setModalEditarLibro(false);
    setLibroSeleccionado(null);
  };

  const handleEliminarLibro = async (id: number) => {
    if (await confirmar('¿Estás seguro de eliminar este libro?')) {
      setLibros(libros.filter(l => l.id !== id));
    }
  };

  const handleCrearPrestamo = () => {
    const libro = libros.find(l => l.id === nuevoPrestamoForm.libroId);
    if (!libro || libro.cantidadDisponible <= 0) {
      avisar.error('No hay copias disponibles de este libro');
      return;
    }

    const nuevoPrestamo: Prestamo = {
      id: prestamos.length + 1,
      libroTitulo: libro.titulo,
      libroAutor: libro.autor,
      usuarioNombre: nuevoPrestamoForm.usuarioNombre,
      fechaPrestamo: new Date().toISOString().split('T')[0],
      fechaDevolucionEsperada: nuevoPrestamoForm.fechaDevolucion,
      estado: 'activo',
      diasRestantes: Math.ceil((new Date(nuevoPrestamoForm.fechaDevolucion).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    };

    setPrestamos([...prestamos, nuevoPrestamo]);
    setLibros(libros.map(l =>
      l.id === nuevoPrestamoForm.libroId
        ? { ...l, cantidadDisponible: l.cantidadDisponible - 1, estado: l.cantidadDisponible - 1 > 0 ? 'disponible' : 'prestado' }
        : l
    ));
    setModalNuevoPrestamo(false);
    setNuevoPrestamoForm({
      libroId: 0,
      usuarioId: '',
      usuarioNombre: '',
      fechaDevolucion: ''
    });
  };

  const handleRegistrarDevolucion = () => {
    if (!prestamoSeleccionado) return;

    const prestamo = prestamos.find(p => p.id === prestamoSeleccionado.id);
    if (!prestamo) return;

    const libro = libros.find(l => l.titulo === prestamo.libroTitulo);
    if (libro) {
      setLibros(libros.map(l =>
        l.id === libro.id
          ? { ...l, cantidadDisponible: l.cantidadDisponible + 1, estado: 'disponible' }
          : l
      ));
    }

    setPrestamos(prestamos.map(p =>
      p.id === prestamoSeleccionado.id
        ? { ...p, estado: 'devuelto' }
        : p
    ));
    setModalDevolucion(false);
    setPrestamoSeleccionado(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className={`text-2xl font-bold text-pn-ink`}>Biblioteca - Administración</h2>
        <button
          onClick={() => setModalNuevoLibro(true)}
          className="bg-pn-accent hover:bg-pn-accent-hover text-pn-accent-ink px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={20} />
          Nuevo Libro
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`bg-pn-surface rounded-lg shadow p-4 border border-pn-line`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm text-pn-ink-2`}>Total Libros</p>
              <p className={`text-2xl font-bold text-pn-ink`}>{stats.totalLibros}</p>
            </div>
            <Book className="text-pn-accent-text" size={32} />
          </div>
        </div>
        <div className={`bg-pn-surface rounded-lg shadow p-4 border border-pn-line`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm text-pn-ink-2`}>Total Copias</p>
              <p className={`text-2xl font-bold text-pn-ink`}>{stats.totalCopias}</p>
            </div>
            <BookOpen className="text-pn-accent-2-text" size={32} />
          </div>
        </div>
        <div className={`bg-pn-surface rounded-lg shadow p-4 border border-pn-line`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm text-pn-ink-2`}>Disponibles</p>
              <p className={`text-2xl font-bold text-pn-ok`}>{stats.copiasDisponibles}</p>
            </div>
            <CheckCircle className="text-pn-ok" size={32} />
          </div>
        </div>
        <div className={`bg-pn-surface rounded-lg shadow p-4 border border-pn-line`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm text-pn-ink-2`}>Préstamos Activos</p>
              <p className={`text-2xl font-bold text-pn-warn`}>{stats.prestamosActivos}</p>
            </div>
            <TrendingUp className="text-pn-warn" size={32} />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-pn-line">
        <button
          onClick={() => setActiveTab('catalogo')}
          className={`px-6 py-3 font-medium transition ${
            activeTab === 'catalogo'
              ? 'border-b-2 border-pn-accent-line text-pn-accent-text'
              : 'text-pn-ink-2 hover:text-pn-ink'
          }`}
        >
          Catálogo de Libros
        </button>
        <button
          onClick={() => setActiveTab('prestamos')}
          className={`px-6 py-3 font-medium transition ${
            activeTab === 'prestamos'
              ? 'border-b-2 border-pn-accent-line text-pn-accent-text'
              : 'text-pn-ink-2 hover:text-pn-ink'
          }`}
        >
          Préstamos
          {stats.prestamosActivos > 0 && (
            <span className="ml-2 bg-pn-accent text-pn-accent-ink text-xs px-2 py-1 rounded-full">
              {stats.prestamosActivos}
            </span>
          )}
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'catalogo' ? (
        <>
          {/* Search and Filters */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-pn-muted`} size={20} />
              <input
                type="text"
                placeholder="Buscar por título, autor o ISBN..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-pn-accent focus:outline-none ${input}`}
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className={`px-4 py-3 border rounded-lg focus:ring-2 focus:ring-pn-accent focus:outline-none ${input}`}
            >
              <option value="Todas">Todas las categorías</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Books Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredLibros.map(libro => (
              <div key={libro.id} className={`bg-pn-surface rounded-lg shadow p-6 border border-pn-line`}>
                <div className="flex items-start gap-4 mb-4">
                  <div className={`w-16 h-20 bg-pn-surface-3 rounded flex items-center justify-center`}>
                    <BookOpen size={32} className={'text-pn-muted'} />
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-bold text-pn-ink mb-1`}>{libro.titulo}</h3>
                    <p className={`text-sm text-pn-ink-2`}>{libro.autor}</p>
                    <span className={`inline-block mt-2 text-xs px-2 py-1 rounded ${
                      libro.cantidadDisponible > 0
                        ? 'bg-pn-ok-soft text-pn-ok'
                        : 'bg-pn-danger-soft text-pn-danger'
                    }`}>
                      {libro.cantidadDisponible > 0 ? 'Disponible' : 'No disponible'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between">
                    <span className={'text-pn-ink-2'}>ISBN:</span>
                    <span className="text-pn-ink">{libro.isbn}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={'text-pn-ink-2'}>Editorial:</span>
                    <span className="text-pn-ink">{libro.editorial}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={'text-pn-ink-2'}>Categoría:</span>
                    <span className="text-pn-ink">{libro.categoria}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={'text-pn-ink-2'}>Disponibles:</span>
                    <span className="text-pn-ink">{libro.cantidadDisponible} / {libro.cantidadTotal}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setLibroSeleccionado(libro);
                      setModalDetalleLibro(true);
                    }}
                    className="flex-1 bg-pn-accent hover:bg-pn-accent-hover text-pn-accent-ink px-3 py-2 rounded text-sm flex items-center justify-center gap-1"
                  >
                    <Eye size={16} />
                    Ver
                  </button>
                  <button
                    onClick={() => {
                      setLibroSeleccionado(libro);
                      setModalEditarLibro(true);
                    }}
                    className="flex-1 bg-pn-ink hover:bg-pn-ink text-pn-surface px-3 py-2 rounded text-sm flex items-center justify-center gap-1"
                  >
                    <Edit size={16} />
                    Editar
                  </button>
                  <button
                    onClick={() => handleEliminarLibro(libro.id)}
                    className="bg-pn-danger hover:bg-pn-danger text-pn-surface px-3 py-2 rounded text-sm"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          {/* Loans Section */}
          <div className="flex justify-between items-center">
            <h3 className={`text-lg font-bold text-pn-ink`}>Préstamos Activos</h3>
            <button
              onClick={() => setModalNuevoPrestamo(true)}
              className="bg-pn-ok hover:bg-pn-ok text-pn-surface px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <Plus size={20} />
              Nuevo Préstamo
            </button>
          </div>

          <div className="space-y-3">
            {prestamos.filter(p => p.estado !== 'devuelto').map(prestamo => (
              <div key={prestamo.id} className={`bg-pn-surface p-4 border border-pn-line rounded-lg`}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className={`font-bold text-pn-ink`}>{prestamo.libroTitulo}</h4>
                    <p className={`text-sm text-pn-ink-2 mt-1`}>
                      {prestamo.libroAutor}
                    </p>
                    <div className={`flex items-center gap-4 mt-2 text-sm text-pn-ink-2`}>
                      <span className="flex items-center gap-1">
                        <User size={14} />
                        {prestamo.usuarioNombre}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        Préstamo: {prestamo.fechaPrestamo}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        Devolver: {prestamo.fechaDevolucionEsperada}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <span className={`px-3 py-1 rounded text-sm ${
                      prestamo.estado === 'vencido'
                        ? 'bg-pn-danger-soft text-pn-danger'
                        : prestamo.diasRestantes && prestamo.diasRestantes <= 3
                        ? 'bg-pn-warn-soft text-pn-warn'
                        : 'bg-pn-ok-soft text-pn-ok'
                    }`}>
                      {prestamo.estado === 'vencido' ? 'Vencido' : `${prestamo.diasRestantes} días`}
                    </span>
                    <button
                      onClick={() => {
                        setPrestamoSeleccionado(prestamo);
                        setModalDevolucion(true);
                      }}
                      className="bg-pn-ok hover:bg-pn-ok text-pn-surface px-4 py-2 rounded text-sm"
                    >
                      Registrar Devolución
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Modal: Nuevo Libro */}
      {modalNuevoLibro && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div role="dialog" aria-modal="true" aria-label="Nuevo Libro" className={`bg-pn-surface rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto`}>
            <div className={`p-6 border-b border-pn-line`}>
              <div className="flex justify-between items-center">
                <h3 className={`text-xl font-bold text-pn-ink`}>Nuevo Libro</h3>
                <button onClick={() => setModalNuevoLibro(false)} className={'text-pn-ink-2'}>
                  <X size={24} />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className={`block text-sm font-medium text-pn-ink mb-2`}>Título *</label>
                <input
                  type="text"
                  value={nuevoLibroForm.titulo}
                  onChange={(e) => setNuevoLibroForm({...nuevoLibroForm, titulo: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pn-accent focus:outline-none ${input}`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium text-pn-ink mb-2`}>Autor *</label>
                <input
                  type="text"
                  value={nuevoLibroForm.autor}
                  onChange={(e) => setNuevoLibroForm({...nuevoLibroForm, autor: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pn-accent focus:outline-none ${input}`}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium text-pn-ink mb-2`}>ISBN *</label>
                  <input
                    type="text"
                    value={nuevoLibroForm.isbn}
                    onChange={(e) => setNuevoLibroForm({...nuevoLibroForm, isbn: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pn-accent focus:outline-none ${input}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium text-pn-ink mb-2`}>Editorial *</label>
                  <input
                    type="text"
                    value={nuevoLibroForm.editorial}
                    onChange={(e) => setNuevoLibroForm({...nuevoLibroForm, editorial: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pn-accent focus:outline-none ${input}`}
                  />
                </div>
              </div>
              <div>
                <label className={`block text-sm font-medium text-pn-ink mb-2`}>Categoría *</label>
                <input
                  type="text"
                  value={nuevoLibroForm.categoria}
                  onChange={(e) => setNuevoLibroForm({...nuevoLibroForm, categoria: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pn-accent focus:outline-none ${input}`}
                  placeholder="Ej: Matemáticas, Programación, etc."
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium text-pn-ink mb-2`}>Cantidad Total *</label>
                  <input
                    type="number"
                    min="1"
                    value={nuevoLibroForm.cantidadTotal}
                    onChange={(e) => setNuevoLibroForm({...nuevoLibroForm, cantidadTotal: parseInt(e.target.value) || 1})}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pn-accent focus:outline-none ${input}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium text-pn-ink mb-2`}>Cantidad Disponible *</label>
                  <input
                    type="number"
                    min="0"
                    max={nuevoLibroForm.cantidadTotal}
                    value={nuevoLibroForm.cantidadDisponible}
                    onChange={(e) => setNuevoLibroForm({...nuevoLibroForm, cantidadDisponible: parseInt(e.target.value) || 0})}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pn-accent focus:outline-none ${input}`}
                  />
                </div>
              </div>
              <div>
                <label className={`block text-sm font-medium text-pn-ink mb-2`}>Descripción</label>
                <textarea
                  value={nuevoLibroForm.descripcion}
                  onChange={(e) => setNuevoLibroForm({...nuevoLibroForm, descripcion: e.target.value})}
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pn-accent focus:outline-none ${input}`}
                  placeholder="Descripción breve del libro..."
                />
              </div>
            </div>
            <div className={`p-6 border-t border-pn-line flex justify-end gap-3`}>
              <button
                onClick={() => setModalNuevoLibro(false)}
                className={`px-4 py-2 rounded-lg bg-pn-surface-3 text-pn-ink`}
              >
                Cancelar
              </button>
              <button
                onClick={handleCrearLibro}
                className="bg-pn-accent hover:bg-pn-accent-hover text-pn-accent-ink px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <Save size={20} />
                Guardar Libro
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Editar Libro */}
      {modalEditarLibro && libroSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div role="dialog" aria-modal="true" aria-label="Editar Libro" className={`bg-pn-surface rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto`}>
            <div className={`p-6 border-b border-pn-line`}>
              <div className="flex justify-between items-center">
                <h3 className={`text-xl font-bold text-pn-ink`}>Editar Libro</h3>
                <button onClick={() => setModalEditarLibro(false)} className={'text-pn-ink-2'}>
                  <X size={24} />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className={`block text-sm font-medium text-pn-ink mb-2`}>Título</label>
                <input
                  type="text"
                  value={libroSeleccionado.titulo}
                  onChange={(e) => setLibroSeleccionado({...libroSeleccionado, titulo: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pn-accent focus:outline-none ${input}`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium text-pn-ink mb-2`}>Autor</label>
                <input
                  type="text"
                  value={libroSeleccionado.autor}
                  onChange={(e) => setLibroSeleccionado({...libroSeleccionado, autor: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pn-accent focus:outline-none ${input}`}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium text-pn-ink mb-2`}>ISBN</label>
                  <input
                    type="text"
                    value={libroSeleccionado.isbn}
                    onChange={(e) => setLibroSeleccionado({...libroSeleccionado, isbn: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pn-accent focus:outline-none ${input}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium text-pn-ink mb-2`}>Editorial</label>
                  <input
                    type="text"
                    value={libroSeleccionado.editorial}
                    onChange={(e) => setLibroSeleccionado({...libroSeleccionado, editorial: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pn-accent focus:outline-none ${input}`}
                  />
                </div>
              </div>
              <div>
                <label className={`block text-sm font-medium text-pn-ink mb-2`}>Categoría</label>
                <input
                  type="text"
                  value={libroSeleccionado.categoria}
                  onChange={(e) => setLibroSeleccionado({...libroSeleccionado, categoria: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pn-accent focus:outline-none ${input}`}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium text-pn-ink mb-2`}>Cantidad Total</label>
                  <input
                    type="number"
                    min="1"
                    value={libroSeleccionado.cantidadTotal}
                    onChange={(e) => setLibroSeleccionado({...libroSeleccionado, cantidadTotal: parseInt(e.target.value) || 1})}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pn-accent focus:outline-none ${input}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium text-pn-ink mb-2`}>Cantidad Disponible</label>
                  <input
                    type="number"
                    min="0"
                    max={libroSeleccionado.cantidadTotal}
                    value={libroSeleccionado.cantidadDisponible}
                    onChange={(e) => setLibroSeleccionado({...libroSeleccionado, cantidadDisponible: parseInt(e.target.value) || 0})}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pn-accent focus:outline-none ${input}`}
                  />
                </div>
              </div>
            </div>
            <div className={`p-6 border-t border-pn-line flex justify-end gap-3`}>
              <button
                onClick={() => setModalEditarLibro(false)}
                className={`px-4 py-2 rounded-lg bg-pn-surface-3 text-pn-ink`}
              >
                Cancelar
              </button>
              <button
                onClick={handleEditarLibro}
                className="bg-pn-accent hover:bg-pn-accent-hover text-pn-accent-ink px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <Save size={20} />
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Detalle Libro */}
      {modalDetalleLibro && libroSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div role="dialog" aria-modal="true" aria-label="Detalle del Libro" className={`bg-pn-surface rounded-lg shadow-xl w-full max-w-lg`}>
            <div className={`p-6 border-b border-pn-line`}>
              <div className="flex justify-between items-center">
                <h3 className={`text-xl font-bold text-pn-ink`}>Detalle del Libro</h3>
                <button onClick={() => setModalDetalleLibro(false)} className={'text-pn-ink-2'}>
                  <X size={24} />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <h4 className={`text-lg font-bold text-pn-ink`}>{libroSeleccionado.titulo}</h4>
                <p className={`text-sm text-pn-ink-2`}>{libroSeleccionado.autor}</p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className={`text-sm text-pn-ink-2`}>ISBN:</span>
                  <span className={`text-sm text-pn-ink`}>{libroSeleccionado.isbn}</span>
                </div>
                <div className="flex justify-between">
                  <span className={`text-sm text-pn-ink-2`}>Editorial:</span>
                  <span className={`text-sm text-pn-ink`}>{libroSeleccionado.editorial}</span>
                </div>
                <div className="flex justify-between">
                  <span className={`text-sm text-pn-ink-2`}>Categoría:</span>
                  <span className={`text-sm text-pn-ink`}>{libroSeleccionado.categoria}</span>
                </div>
                <div className="flex justify-between">
                  <span className={`text-sm text-pn-ink-2`}>Total Copias:</span>
                  <span className={`text-sm text-pn-ink`}>{libroSeleccionado.cantidadTotal}</span>
                </div>
                <div className="flex justify-between">
                  <span className={`text-sm text-pn-ink-2`}>Copias Disponibles:</span>
                  <span className={`text-sm font-bold ${libroSeleccionado.cantidadDisponible > 0 ? 'text-pn-ok' : 'text-pn-danger'}`}>
                    {libroSeleccionado.cantidadDisponible}
                  </span>
                </div>
              </div>
              {libroSeleccionado.descripcion && (
                <div>
                  <p className={`text-sm text-pn-ink-2 mb-1`}>Descripción:</p>
                  <p className={`text-sm text-pn-ink`}>{libroSeleccionado.descripcion}</p>
                </div>
              )}
            </div>
            <div className={`p-6 border-t border-pn-line flex justify-end`}>
              <button
                onClick={() => setModalDetalleLibro(false)}
                className="bg-pn-accent hover:bg-pn-accent-hover text-pn-accent-ink px-4 py-2 rounded-lg"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Nuevo Préstamo */}
      {modalNuevoPrestamo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div role="dialog" aria-modal="true" aria-label="Nuevo Préstamo" className={`bg-pn-surface rounded-lg shadow-xl w-full max-w-lg`}>
            <div className={`p-6 border-b border-pn-line`}>
              <div className="flex justify-between items-center">
                <h3 className={`text-xl font-bold text-pn-ink`}>Nuevo Préstamo</h3>
                <button onClick={() => setModalNuevoPrestamo(false)} className={'text-pn-ink-2'}>
                  <X size={24} />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className={`block text-sm font-medium text-pn-ink mb-2`}>Libro *</label>
                <select
                  value={nuevoPrestamoForm.libroId}
                  onChange={(e) => setNuevoPrestamoForm({...nuevoPrestamoForm, libroId: parseInt(e.target.value)})}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pn-accent focus:outline-none ${input}`}
                >
                  <option value={0}>Seleccionar libro...</option>
                  {libros.filter(l => l.cantidadDisponible > 0).map(libro => (
                    <option key={libro.id} value={libro.id}>
                      {libro.titulo} - {libro.autor} ({libro.cantidadDisponible} disponibles)
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium text-pn-ink mb-2`}>Usuario *</label>
                <input
                  type="text"
                  value={nuevoPrestamoForm.usuarioNombre}
                  onChange={(e) => setNuevoPrestamoForm({...nuevoPrestamoForm, usuarioNombre: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pn-accent focus:outline-none ${input}`}
                  placeholder="Nombre del estudiante"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium text-pn-ink mb-2`}>Fecha de Devolución *</label>
                <input
                  type="date"
                  value={nuevoPrestamoForm.fechaDevolucion}
                  onChange={(e) => setNuevoPrestamoForm({...nuevoPrestamoForm, fechaDevolucion: e.target.value})}
                  min={new Date().toISOString().split('T')[0]}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pn-accent focus:outline-none ${input}`}
                />
              </div>
            </div>
            <div className={`p-6 border-t border-pn-line flex justify-end gap-3`}>
              <button
                onClick={() => setModalNuevoPrestamo(false)}
                className={`px-4 py-2 rounded-lg bg-pn-surface-3 text-pn-ink`}
              >
                Cancelar
              </button>
              <button
                onClick={handleCrearPrestamo}
                className="bg-pn-ok hover:bg-pn-ok text-pn-surface px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <Save size={20} />
                Registrar Préstamo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Registrar Devolución */}
      {modalDevolucion && prestamoSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div role="dialog" aria-modal="true" aria-label="Registrar Devolución" className={`bg-pn-surface rounded-lg shadow-xl w-full max-w-md`}>
            <div className={`p-6 border-b border-pn-line`}>
              <div className="flex justify-between items-center">
                <h3 className={`text-xl font-bold text-pn-ink`}>Registrar Devolución</h3>
                <button onClick={() => setModalDevolucion(false)} className={'text-pn-ink-2'}>
                  <X size={24} />
                </button>
              </div>
            </div>
            <div className="p-6">
              <p className={`text-sm text-pn-ink-2 mb-4`}>
                ¿Confirmar la devolución del siguiente libro?
              </p>
              <div className={`p-4 border border-pn-line rounded-lg`}>
                <h4 className={`font-bold text-pn-ink`}>{prestamoSeleccionado.libroTitulo}</h4>
                <p className={`text-sm text-pn-ink-2 mt-1`}>
                  Usuario: {prestamoSeleccionado.usuarioNombre}
                </p>
                <p className={`text-sm text-pn-ink-2`}>
                  Fecha de préstamo: {prestamoSeleccionado.fechaPrestamo}
                </p>
              </div>
            </div>
            <div className={`p-6 border-t border-pn-line flex justify-end gap-3`}>
              <button
                onClick={() => setModalDevolucion(false)}
                className={`px-4 py-2 rounded-lg bg-pn-surface-3 text-pn-ink`}
              >
                Cancelar
              </button>
              <button
                onClick={handleRegistrarDevolucion}
                className="bg-pn-ok hover:bg-pn-ok text-pn-surface px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <CheckCircle size={20} />
                Confirmar Devolución
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
