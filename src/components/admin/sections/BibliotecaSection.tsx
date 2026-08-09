import React, { useState, useMemo } from 'react';
import {
  BookOpen, Search, Plus, Edit, Trash2, Eye, X, Save,
  Calendar, User, CheckCircle, XCircle, AlertCircle, Filter,
  TrendingUp, Clock, Book
} from 'lucide-react';

interface BibliotecaSectionProps {
  darkMode?: boolean;
}

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

export const BibliotecaSection: React.FC<BibliotecaSectionProps> = ({ darkMode = false }) => {
  // Theme classes
  const card = darkMode ? 'bg-gray-800' : 'bg-white';
  const text = darkMode ? 'text-gray-100' : 'text-gray-800';
  const border = darkMode ? 'border-gray-700' : 'border-gray-200';
  const input = darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300';

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

  const handleEliminarLibro = (id: number) => {
    if (confirm('¿Estás seguro de eliminar este libro?')) {
      setLibros(libros.filter(l => l.id !== id));
    }
  };

  const handleCrearPrestamo = () => {
    const libro = libros.find(l => l.id === nuevoPrestamoForm.libroId);
    if (!libro || libro.cantidadDisponible <= 0) {
      alert('No hay copias disponibles de este libro');
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
        <h2 className={`text-2xl font-bold ${text}`}>Biblioteca - Administración</h2>
        <button
          onClick={() => setModalNuevoLibro(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={20} />
          Nuevo Libro
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`${card} rounded-lg shadow p-4 border ${border}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Libros</p>
              <p className={`text-2xl font-bold ${text}`}>{stats.totalLibros}</p>
            </div>
            <Book className="text-blue-500" size={32} />
          </div>
        </div>
        <div className={`${card} rounded-lg shadow p-4 border ${border}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Copias</p>
              <p className={`text-2xl font-bold ${text}`}>{stats.totalCopias}</p>
            </div>
            <BookOpen className="text-purple-500" size={32} />
          </div>
        </div>
        <div className={`${card} rounded-lg shadow p-4 border ${border}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Disponibles</p>
              <p className={`text-2xl font-bold text-green-500`}>{stats.copiasDisponibles}</p>
            </div>
            <CheckCircle className="text-green-500" size={32} />
          </div>
        </div>
        <div className={`${card} rounded-lg shadow p-4 border ${border}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Préstamos Activos</p>
              <p className={`text-2xl font-bold text-orange-500`}>{stats.prestamosActivos}</p>
            </div>
            <TrendingUp className="text-orange-500" size={32} />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-300 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('catalogo')}
          className={`px-6 py-3 font-medium transition ${
            activeTab === 'catalogo'
              ? 'border-b-2 border-blue-500 text-blue-500'
              : darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Catálogo de Libros
        </button>
        <button
          onClick={() => setActiveTab('prestamos')}
          className={`px-6 py-3 font-medium transition ${
            activeTab === 'prestamos'
              ? 'border-b-2 border-blue-500 text-blue-500'
              : darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Préstamos
          {stats.prestamosActivos > 0 && (
            <span className="ml-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
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
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} size={20} />
              <input
                type="text"
                placeholder="Buscar por título, autor o ISBN..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none ${input}`}
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className={`px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none ${input}`}
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
              <div key={libro.id} className={`${card} rounded-lg shadow p-6 border ${border}`}>
                <div className="flex items-start gap-4 mb-4">
                  <div className={`w-16 h-20 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded flex items-center justify-center`}>
                    <BookOpen size={32} className={darkMode ? 'text-gray-500' : 'text-gray-400'} />
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-bold ${text} mb-1`}>{libro.titulo}</h3>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{libro.autor}</p>
                    <span className={`inline-block mt-2 text-xs px-2 py-1 rounded ${
                      libro.cantidadDisponible > 0
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {libro.cantidadDisponible > 0 ? 'Disponible' : 'No disponible'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between">
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>ISBN:</span>
                    <span className={text}>{libro.isbn}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Editorial:</span>
                    <span className={text}>{libro.editorial}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Categoría:</span>
                    <span className={text}>{libro.categoria}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Disponibles:</span>
                    <span className={text}>{libro.cantidadDisponible} / {libro.cantidadTotal}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setLibroSeleccionado(libro);
                      setModalDetalleLibro(true);
                    }}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm flex items-center justify-center gap-1"
                  >
                    <Eye size={16} />
                    Ver
                  </button>
                  <button
                    onClick={() => {
                      setLibroSeleccionado(libro);
                      setModalEditarLibro(true);
                    }}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded text-sm flex items-center justify-center gap-1"
                  >
                    <Edit size={16} />
                    Editar
                  </button>
                  <button
                    onClick={() => handleEliminarLibro(libro.id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm"
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
            <h3 className={`text-lg font-bold ${text}`}>Préstamos Activos</h3>
            <button
              onClick={() => setModalNuevoPrestamo(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <Plus size={20} />
              Nuevo Préstamo
            </button>
          </div>

          <div className="space-y-3">
            {prestamos.filter(p => p.estado !== 'devuelto').map(prestamo => (
              <div key={prestamo.id} className={`${card} p-4 border ${border} rounded-lg`}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className={`font-bold ${text}`}>{prestamo.libroTitulo}</h4>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                      {prestamo.libroAutor}
                    </p>
                    <div className={`flex items-center gap-4 mt-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
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
                        ? 'bg-red-100 text-red-700'
                        : prestamo.diasRestantes && prestamo.diasRestantes <= 3
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {prestamo.estado === 'vencido' ? 'Vencido' : `${prestamo.diasRestantes} días`}
                    </span>
                    <button
                      onClick={() => {
                        setPrestamoSeleccionado(prestamo);
                        setModalDevolucion(true);
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm"
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
          <div className={`${card} rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto`}>
            <div className={`p-6 border-b ${border}`}>
              <div className="flex justify-between items-center">
                <h3 className={`text-xl font-bold ${text}`}>Nuevo Libro</h3>
                <button onClick={() => setModalNuevoLibro(false)} className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                  <X size={24} />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className={`block text-sm font-medium ${text} mb-2`}>Título *</label>
                <input
                  type="text"
                  value={nuevoLibroForm.titulo}
                  onChange={(e) => setNuevoLibroForm({...nuevoLibroForm, titulo: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none ${input}`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${text} mb-2`}>Autor *</label>
                <input
                  type="text"
                  value={nuevoLibroForm.autor}
                  onChange={(e) => setNuevoLibroForm({...nuevoLibroForm, autor: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none ${input}`}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${text} mb-2`}>ISBN *</label>
                  <input
                    type="text"
                    value={nuevoLibroForm.isbn}
                    onChange={(e) => setNuevoLibroForm({...nuevoLibroForm, isbn: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none ${input}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${text} mb-2`}>Editorial *</label>
                  <input
                    type="text"
                    value={nuevoLibroForm.editorial}
                    onChange={(e) => setNuevoLibroForm({...nuevoLibroForm, editorial: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none ${input}`}
                  />
                </div>
              </div>
              <div>
                <label className={`block text-sm font-medium ${text} mb-2`}>Categoría *</label>
                <input
                  type="text"
                  value={nuevoLibroForm.categoria}
                  onChange={(e) => setNuevoLibroForm({...nuevoLibroForm, categoria: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none ${input}`}
                  placeholder="Ej: Matemáticas, Programación, etc."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${text} mb-2`}>Cantidad Total *</label>
                  <input
                    type="number"
                    min="1"
                    value={nuevoLibroForm.cantidadTotal}
                    onChange={(e) => setNuevoLibroForm({...nuevoLibroForm, cantidadTotal: parseInt(e.target.value) || 1})}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none ${input}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${text} mb-2`}>Cantidad Disponible *</label>
                  <input
                    type="number"
                    min="0"
                    max={nuevoLibroForm.cantidadTotal}
                    value={nuevoLibroForm.cantidadDisponible}
                    onChange={(e) => setNuevoLibroForm({...nuevoLibroForm, cantidadDisponible: parseInt(e.target.value) || 0})}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none ${input}`}
                  />
                </div>
              </div>
              <div>
                <label className={`block text-sm font-medium ${text} mb-2`}>Descripción</label>
                <textarea
                  value={nuevoLibroForm.descripcion}
                  onChange={(e) => setNuevoLibroForm({...nuevoLibroForm, descripcion: e.target.value})}
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none ${input}`}
                  placeholder="Descripción breve del libro..."
                />
              </div>
            </div>
            <div className={`p-6 border-t ${border} flex justify-end gap-3`}>
              <button
                onClick={() => setModalNuevoLibro(false)}
                className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-800'}`}
              >
                Cancelar
              </button>
              <button
                onClick={handleCrearLibro}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
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
          <div className={`${card} rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto`}>
            <div className={`p-6 border-b ${border}`}>
              <div className="flex justify-between items-center">
                <h3 className={`text-xl font-bold ${text}`}>Editar Libro</h3>
                <button onClick={() => setModalEditarLibro(false)} className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                  <X size={24} />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className={`block text-sm font-medium ${text} mb-2`}>Título</label>
                <input
                  type="text"
                  value={libroSeleccionado.titulo}
                  onChange={(e) => setLibroSeleccionado({...libroSeleccionado, titulo: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none ${input}`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${text} mb-2`}>Autor</label>
                <input
                  type="text"
                  value={libroSeleccionado.autor}
                  onChange={(e) => setLibroSeleccionado({...libroSeleccionado, autor: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none ${input}`}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${text} mb-2`}>ISBN</label>
                  <input
                    type="text"
                    value={libroSeleccionado.isbn}
                    onChange={(e) => setLibroSeleccionado({...libroSeleccionado, isbn: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none ${input}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${text} mb-2`}>Editorial</label>
                  <input
                    type="text"
                    value={libroSeleccionado.editorial}
                    onChange={(e) => setLibroSeleccionado({...libroSeleccionado, editorial: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none ${input}`}
                  />
                </div>
              </div>
              <div>
                <label className={`block text-sm font-medium ${text} mb-2`}>Categoría</label>
                <input
                  type="text"
                  value={libroSeleccionado.categoria}
                  onChange={(e) => setLibroSeleccionado({...libroSeleccionado, categoria: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none ${input}`}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${text} mb-2`}>Cantidad Total</label>
                  <input
                    type="number"
                    min="1"
                    value={libroSeleccionado.cantidadTotal}
                    onChange={(e) => setLibroSeleccionado({...libroSeleccionado, cantidadTotal: parseInt(e.target.value) || 1})}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none ${input}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${text} mb-2`}>Cantidad Disponible</label>
                  <input
                    type="number"
                    min="0"
                    max={libroSeleccionado.cantidadTotal}
                    value={libroSeleccionado.cantidadDisponible}
                    onChange={(e) => setLibroSeleccionado({...libroSeleccionado, cantidadDisponible: parseInt(e.target.value) || 0})}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none ${input}`}
                  />
                </div>
              </div>
            </div>
            <div className={`p-6 border-t ${border} flex justify-end gap-3`}>
              <button
                onClick={() => setModalEditarLibro(false)}
                className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-800'}`}
              >
                Cancelar
              </button>
              <button
                onClick={handleEditarLibro}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
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
          <div className={`${card} rounded-lg shadow-xl w-full max-w-lg`}>
            <div className={`p-6 border-b ${border}`}>
              <div className="flex justify-between items-center">
                <h3 className={`text-xl font-bold ${text}`}>Detalle del Libro</h3>
                <button onClick={() => setModalDetalleLibro(false)} className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                  <X size={24} />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <h4 className={`text-lg font-bold ${text}`}>{libroSeleccionado.titulo}</h4>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{libroSeleccionado.autor}</p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>ISBN:</span>
                  <span className={`text-sm ${text}`}>{libroSeleccionado.isbn}</span>
                </div>
                <div className="flex justify-between">
                  <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Editorial:</span>
                  <span className={`text-sm ${text}`}>{libroSeleccionado.editorial}</span>
                </div>
                <div className="flex justify-between">
                  <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Categoría:</span>
                  <span className={`text-sm ${text}`}>{libroSeleccionado.categoria}</span>
                </div>
                <div className="flex justify-between">
                  <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Copias:</span>
                  <span className={`text-sm ${text}`}>{libroSeleccionado.cantidadTotal}</span>
                </div>
                <div className="flex justify-between">
                  <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Copias Disponibles:</span>
                  <span className={`text-sm font-bold ${libroSeleccionado.cantidadDisponible > 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {libroSeleccionado.cantidadDisponible}
                  </span>
                </div>
              </div>
              {libroSeleccionado.descripcion && (
                <div>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Descripción:</p>
                  <p className={`text-sm ${text}`}>{libroSeleccionado.descripcion}</p>
                </div>
              )}
            </div>
            <div className={`p-6 border-t ${border} flex justify-end`}>
              <button
                onClick={() => setModalDetalleLibro(false)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
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
          <div className={`${card} rounded-lg shadow-xl w-full max-w-lg`}>
            <div className={`p-6 border-b ${border}`}>
              <div className="flex justify-between items-center">
                <h3 className={`text-xl font-bold ${text}`}>Nuevo Préstamo</h3>
                <button onClick={() => setModalNuevoPrestamo(false)} className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                  <X size={24} />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className={`block text-sm font-medium ${text} mb-2`}>Libro *</label>
                <select
                  value={nuevoPrestamoForm.libroId}
                  onChange={(e) => setNuevoPrestamoForm({...nuevoPrestamoForm, libroId: parseInt(e.target.value)})}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none ${input}`}
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
                <label className={`block text-sm font-medium ${text} mb-2`}>Usuario *</label>
                <input
                  type="text"
                  value={nuevoPrestamoForm.usuarioNombre}
                  onChange={(e) => setNuevoPrestamoForm({...nuevoPrestamoForm, usuarioNombre: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none ${input}`}
                  placeholder="Nombre del estudiante"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${text} mb-2`}>Fecha de Devolución *</label>
                <input
                  type="date"
                  value={nuevoPrestamoForm.fechaDevolucion}
                  onChange={(e) => setNuevoPrestamoForm({...nuevoPrestamoForm, fechaDevolucion: e.target.value})}
                  min={new Date().toISOString().split('T')[0]}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none ${input}`}
                />
              </div>
            </div>
            <div className={`p-6 border-t ${border} flex justify-end gap-3`}>
              <button
                onClick={() => setModalNuevoPrestamo(false)}
                className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-800'}`}
              >
                Cancelar
              </button>
              <button
                onClick={handleCrearPrestamo}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
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
          <div className={`${card} rounded-lg shadow-xl w-full max-w-md`}>
            <div className={`p-6 border-b ${border}`}>
              <div className="flex justify-between items-center">
                <h3 className={`text-xl font-bold ${text}`}>Registrar Devolución</h3>
                <button onClick={() => setModalDevolucion(false)} className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                  <X size={24} />
                </button>
              </div>
            </div>
            <div className="p-6">
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
                ¿Confirmar la devolución del siguiente libro?
              </p>
              <div className={`p-4 border ${border} rounded-lg`}>
                <h4 className={`font-bold ${text}`}>{prestamoSeleccionado.libroTitulo}</h4>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                  Usuario: {prestamoSeleccionado.usuarioNombre}
                </p>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Fecha de préstamo: {prestamoSeleccionado.fechaPrestamo}
                </p>
              </div>
            </div>
            <div className={`p-6 border-t ${border} flex justify-end gap-3`}>
              <button
                onClick={() => setModalDevolucion(false)}
                className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-800'}`}
              >
                Cancelar
              </button>
              <button
                onClick={handleRegistrarDevolucion}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
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
