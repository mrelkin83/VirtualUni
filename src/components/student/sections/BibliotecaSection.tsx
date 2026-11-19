import React, { useState, useMemo } from 'react';
import { Book, BookOpen, Search, Filter, Calendar, User, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Book as BookType, LibraryLoan } from '../../../types/student.types';

interface BibliotecaSectionProps {
  libros: BookType[];
  prestamos: LibraryLoan[];
  solicitarPrestamo: (libroId: string | number) => void;
  devolverLibro: (prestamoId: string | number) => void;
  reservarLibro: (libroId: string | number) => void;
}

// Componente de búsqueda
const SearchBar: React.FC<{
  value: string;
  onChange: (value: string) => void;
}> = ({ value, onChange }) => (
  <div className="relative">
    <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-pn-muted`} size={20} />
    <input
      type="text"
      placeholder="Buscar por título, autor o ISBN..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full pl-10 pr-4 py-3 border border-pn-line rounded-lg focus:ring-2 focus:ring-pn-accent focus:outline-none bg-pn-surface text-pn-ink`}
    />
  </div>
);

// Componente de filtro de categorías
const CategoryFilter: React.FC<{
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}> = ({ categories, selectedCategory, onSelectCategory }) => (
  <div className="flex flex-wrap gap-2">
    <button
      onClick={() => onSelectCategory('Todas')}
      className={`px-4 py-2 rounded-lg transition ${
        selectedCategory === 'Todas'
          ? 'bg-pn-accent text-pn-accent-ink'
          : 'bg-pn-surface-3 text-pn-ink-2 hover:bg-pn-line'
      }`}
    >
      Todas
    </button>
    {categories.map((category) => (
      <button
        key={category}
        onClick={() => onSelectCategory(category)}
        className={`px-4 py-2 rounded-lg transition ${
          selectedCategory === category
            ? 'bg-pn-accent text-pn-accent-ink'
            : 'bg-pn-surface-3 text-pn-ink-2 hover:bg-pn-line'
        }`}
      >
        {category}
      </button>
    ))}
  </div>
);

// Componente de tarjeta de libro
const BookCard: React.FC<{
  libro: BookType;
  onSolicitarPrestamo: () => void;
  onReservar: () => void;
}> = ({ libro, onSolicitarPrestamo, onReservar }) => (
  <div className={`bg-pn-surface rounded-lg shadow-md p-6 border border-pn-line hover:shadow-lg transition`}>
    <div className="flex items-start gap-4">
      <div className={`w-16 h-20 bg-pn-surface-3 rounded flex items-center justify-center`}>
        <BookOpen size={32} className={'text-pn-muted'} />
      </div>
      <div className="flex-1">
        <h3 className={`text-lg font-bold text-pn-ink mb-1`}>{libro.titulo}</h3>
        <p className={`text-sm text-pn-ink-2 mb-2`}>
          <User size={14} className="inline mr-1" />
          {libro.autor}
        </p>
        <div className="flex flex-wrap gap-2 mb-3">
          <span className={`text-xs px-2 py-1 rounded bg-pn-accent-soft text-pn-accent-text`}>
            {libro.categoria}
          </span>
          {libro.isbn && (
            <span className={`text-xs text-pn-muted`}>
              ISBN: {libro.isbn}
            </span>
          )}
        </div>
        {libro.descripcion && (
          <p className={`text-sm text-pn-ink-2 mb-3 line-clamp-2`}>
            {libro.descripcion}
          </p>
        )}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className={`text-sm text-pn-ink-2`}>
              {libro.copiasDisponibles}/{libro.copias} disponibles
            </span>
            {libro.disponible ? (
              <span className="flex items-center text-sm text-pn-ok">
                <CheckCircle size={16} className="mr-1" />
                Disponible
              </span>
            ) : (
              <span className="flex items-center text-sm text-pn-danger">
                <XCircle size={16} className="mr-1" />
                No disponible
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {libro.disponible ? (
              <button
                onClick={onSolicitarPrestamo}
                className="px-4 py-2 bg-pn-accent text-pn-accent-ink rounded-lg hover:bg-pn-accent transition text-sm"
              >
                Solicitar Préstamo
              </button>
            ) : (
              <button
                onClick={onReservar}
                className="px-4 py-2 bg-pn-warn text-pn-surface rounded-lg hover:bg-pn-warn transition text-sm"
              >
                Reservar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Componente de tarjeta de préstamo
const LoanCard: React.FC<{
  prestamo: LibraryLoan;
  onDevolver: () => void;
}> = ({ prestamo, onDevolver }) => {
  const getEstadoColor = () => {
    if (prestamo.estado === 'vencido') return 'text-pn-danger';
    if (prestamo.diasRestantes && prestamo.diasRestantes <= 3) return 'text-pn-warn';
    return 'text-pn-ok';
  };

  const getEstadoIcon = () => {
    if (prestamo.estado === 'vencido') return <XCircle size={16} />;
    if (prestamo.diasRestantes && prestamo.diasRestantes <= 3) return <AlertCircle size={16} />;
    return <CheckCircle size={16} />;
  };

  return (
    <div className={`bg-pn-surface rounded-lg shadow-md p-4 border border-pn-line`}>
      <div className="flex flex-wrap items-center justify-between mb-3 gap-4">
        <h4 className={`font-bold text-pn-ink`}>{prestamo.libroTitulo}</h4>
        <span className={`flex items-center gap-1 text-sm ${getEstadoColor()}`}>
          {getEstadoIcon()}
          {prestamo.estado === 'vencido' ? 'Vencido' : `${prestamo.diasRestantes} días restantes`}
        </span>
      </div>
      <p className={`text-sm text-pn-ink-2 mb-3`}>
        {prestamo.libroAutor}
      </p>
      <div className={`flex items-center gap-4 text-sm text-pn-ink-2 mb-3`}>
        <span className="flex items-center gap-1">
          <Calendar size={14} />
          Préstamo: {new Date(prestamo.fechaPrestamo).toLocaleDateString()}
        </span>
        <span className="flex items-center gap-1">
          <Clock size={14} />
          Devolución: {new Date(prestamo.fechaDevolucion).toLocaleDateString()}
        </span>
      </div>
      {prestamo.estado !== 'devuelto' && (
        <button
          onClick={onDevolver}
          className="w-full px-4 py-2 bg-pn-ok text-pn-surface rounded-lg hover:bg-pn-ok transition text-sm"
        >
          Devolver Libro
        </button>
      )}
    </div>
  );
};

// Componente principal
export const BibliotecaSection: React.FC<BibliotecaSectionProps> = ({
  libros,
  prestamos,
  solicitarPrestamo,
  devolverLibro,
  reservarLibro
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [activeTab, setActiveTab] = useState<'catalogo' | 'prestamos'>('catalogo');

  // Obtener categorías únicas
  const categories = useMemo(() => {
    const uniqueCategories = new Set(libros.map(libro => libro.categoria));
    return Array.from(uniqueCategories);
  }, [libros]);

  // Filtrar libros
  const filteredLibros = useMemo(() => {
    return libros.filter(libro => {
      const matchesSearch =
        libro.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        libro.autor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (libro.isbn && libro.isbn.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCategory = selectedCategory === 'Todas' || libro.categoria === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [libros, searchTerm, selectedCategory]);

  // Estadísticas
  const stats = useMemo(() => ({
    totalLibros: libros.length,
    librosDisponibles: libros.filter(l => l.disponible).length,
    prestamosActivos: prestamos.filter(p => p.estado === 'activo').length,
    prestamosVencidos: prestamos.filter(p => p.estado === 'vencido').length
  }), [libros, prestamos]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className={`text-2xl font-bold text-pn-ink`}>Biblioteca Digital</h2>
        <div className={`flex items-center gap-2 px-4 py-2 bg-pn-surface rounded-lg border border-pn-line`}>
          <Book className="text-pn-accent-text" size={20} />
          <span className={`text-sm text-pn-ink`}>
            {stats.librosDisponibles} de {stats.totalLibros} disponibles
          </span>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`bg-pn-surface rounded-lg shadow p-4 border border-pn-line`}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className={`text-sm text-pn-ink-2`}>Total Libros</p>
              <p className={`text-2xl font-bold text-pn-ink`}>{stats.totalLibros}</p>
            </div>
            <BookOpen className="text-pn-accent-text" size={32} />
          </div>
        </div>
        <div className={`bg-pn-surface rounded-lg shadow p-4 border border-pn-line`}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className={`text-sm text-pn-ink-2`}>Disponibles</p>
              <p className={`text-2xl font-bold text-pn-ok`}>{stats.librosDisponibles}</p>
            </div>
            <CheckCircle className="text-pn-ok" size={32} />
          </div>
        </div>
        <div className={`bg-pn-surface rounded-lg shadow p-4 border border-pn-line`}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className={`text-sm text-pn-ink-2`}>Préstamos Activos</p>
              <p className={`text-2xl font-bold text-pn-accent-text`}>{stats.prestamosActivos}</p>
            </div>
            <Clock className="text-pn-accent-text" size={32} />
          </div>
        </div>
        <div className={`bg-pn-surface rounded-lg shadow p-4 border border-pn-line`}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className={`text-sm text-pn-ink-2`}>Vencidos</p>
              <p className={`text-2xl font-bold text-pn-danger`}>{stats.prestamosVencidos}</p>
            </div>
            <AlertCircle className="text-pn-danger" size={32} />
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
          Catálogo
        </button>
        <button
          onClick={() => setActiveTab('prestamos')}
          className={`px-6 py-3 font-medium transition relative ${
            activeTab === 'prestamos'
              ? 'border-b-2 border-pn-accent-line text-pn-accent-text'
              : 'text-pn-ink-2 hover:text-pn-ink'
          }`}
        >
          Mis Préstamos
          {stats.prestamosActivos > 0 && (
            <span className="absolute -top-1 -right-1 bg-pn-accent text-pn-accent-ink text-xs w-5 h-5 rounded-full flex items-center justify-center">
              {stats.prestamosActivos}
            </span>
          )}
        </button>
      </div>

      {/* Contenido de tabs */}
      {activeTab === 'catalogo' ? (
        <>
          {/* Búsqueda y filtros */}
          <div className="space-y-4">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
            />
            <div className="flex items-center gap-3">
              <Filter className={'text-pn-ink-2'} size={20} />
              <CategoryFilter
                categories={categories}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
              />
            </div>
          </div>

          {/* Lista de libros */}
          <div className="space-y-4">
            {filteredLibros.length > 0 ? (
              filteredLibros.map(libro => (
                <BookCard
                  key={libro.id}
                  libro={libro}
                  onSolicitarPrestamo={() => solicitarPrestamo(libro.id)}
                  onReservar={() => reservarLibro(libro.id)}
                />
              ))
            ) : (
              <div className={`bg-pn-surface rounded-lg shadow p-12 text-center border border-pn-line`}>
                <BookOpen size={64} className={`mx-auto mb-4 text-pn-muted`} />
                <h3 className={`text-xl font-bold text-pn-ink mb-2`}>No se encontraron libros</h3>
                <p className={'text-pn-ink-2'}>
                  Intenta con otros términos de búsqueda o filtros
                </p>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="space-y-4">
          {prestamos.filter(p => p.estado !== 'devuelto').length > 0 ? (
            prestamos
              .filter(p => p.estado !== 'devuelto')
              .map(prestamo => (
                <LoanCard
                  key={prestamo.id}
                  prestamo={prestamo}
                  onDevolver={() => devolverLibro(prestamo.id)}
                />
              ))
          ) : (
            <div className={`bg-pn-surface rounded-lg shadow p-12 text-center border border-pn-line`}>
              <Clock size={64} className={`mx-auto mb-4 text-pn-muted`} />
              <h3 className={`text-xl font-bold text-pn-ink mb-2`}>No tienes préstamos activos</h3>
              <p className={'text-pn-ink-2'}>
                Ve al catálogo para solicitar un préstamo
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
