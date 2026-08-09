import React, { useState, useMemo } from 'react';
import { Book, BookOpen, Search, Filter, Calendar, User, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Book as BookType, LibraryLoan } from '../../../types/student.types';

interface BibliotecaSectionProps {
  libros: BookType[];
  prestamos: LibraryLoan[];
  darkMode: boolean;
  card: string;
  text: string;
  border: string;
  solicitarPrestamo: (libroId: string | number) => void;
  devolverLibro: (prestamoId: string | number) => void;
  reservarLibro: (libroId: string | number) => void;
}

// Componente de búsqueda
const SearchBar: React.FC<{
  value: string;
  onChange: (value: string) => void;
  darkMode: boolean;
  border: string;
  text: string;
}> = ({ value, onChange, darkMode, border, text }) => (
  <div className="relative">
    <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} size={20} />
    <input
      type="text"
      placeholder="Buscar por título, autor o ISBN..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full pl-10 pr-4 py-3 border ${border} rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none ${darkMode ? 'bg-gray-700 text-white' : 'bg-white'}`}
    />
  </div>
);

// Componente de filtro de categorías
const CategoryFilter: React.FC<{
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  darkMode: boolean;
  text: string;
}> = ({ categories, selectedCategory, onSelectCategory, darkMode, text }) => (
  <div className="flex flex-wrap gap-2">
    <button
      onClick={() => onSelectCategory('Todas')}
      className={`px-4 py-2 rounded-lg transition ${
        selectedCategory === 'Todas'
          ? 'bg-blue-500 text-white'
          : darkMode
          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
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
            ? 'bg-blue-500 text-white'
            : darkMode
            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
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
  darkMode: boolean;
  card: string;
  text: string;
  border: string;
  onSolicitarPrestamo: () => void;
  onReservar: () => void;
}> = ({ libro, darkMode, card, text, border, onSolicitarPrestamo, onReservar }) => (
  <div className={`${card} rounded-lg shadow-md p-6 border ${border} hover:shadow-lg transition`}>
    <div className="flex items-start gap-4">
      <div className={`w-16 h-20 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded flex items-center justify-center`}>
        <BookOpen size={32} className={darkMode ? 'text-gray-500' : 'text-gray-400'} />
      </div>
      <div className="flex-1">
        <h3 className={`text-lg font-bold ${text} mb-1`}>{libro.titulo}</h3>
        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
          <User size={14} className="inline mr-1" />
          {libro.autor}
        </p>
        <div className="flex flex-wrap gap-2 mb-3">
          <span className={`text-xs px-2 py-1 rounded ${darkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'}`}>
            {libro.categoria}
          </span>
          {libro.isbn && (
            <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              ISBN: {libro.isbn}
            </span>
          )}
        </div>
        {libro.descripcion && (
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-3 line-clamp-2`}>
            {libro.descripcion}
          </p>
        )}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {libro.copiasDisponibles}/{libro.copias} disponibles
            </span>
            {libro.disponible ? (
              <span className="flex items-center text-sm text-green-500">
                <CheckCircle size={16} className="mr-1" />
                Disponible
              </span>
            ) : (
              <span className="flex items-center text-sm text-red-500">
                <XCircle size={16} className="mr-1" />
                No disponible
              </span>
            )}
          </div>
          <div className="flex gap-2">
            {libro.disponible ? (
              <button
                onClick={onSolicitarPrestamo}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm"
              >
                Solicitar Préstamo
              </button>
            ) : (
              <button
                onClick={onReservar}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition text-sm"
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
  darkMode: boolean;
  card: string;
  text: string;
  border: string;
  onDevolver: () => void;
}> = ({ prestamo, darkMode, card, text, border, onDevolver }) => {
  const getEstadoColor = () => {
    if (prestamo.estado === 'vencido') return 'text-red-500';
    if (prestamo.diasRestantes && prestamo.diasRestantes <= 3) return 'text-orange-500';
    return 'text-green-500';
  };

  const getEstadoIcon = () => {
    if (prestamo.estado === 'vencido') return <XCircle size={16} />;
    if (prestamo.diasRestantes && prestamo.diasRestantes <= 3) return <AlertCircle size={16} />;
    return <CheckCircle size={16} />;
  };

  return (
    <div className={`${card} rounded-lg shadow-md p-4 border ${border}`}>
      <div className="flex items-center justify-between mb-3">
        <h4 className={`font-bold ${text}`}>{prestamo.libroTitulo}</h4>
        <span className={`flex items-center gap-1 text-sm ${getEstadoColor()}`}>
          {getEstadoIcon()}
          {prestamo.estado === 'vencido' ? 'Vencido' : `${prestamo.diasRestantes} días restantes`}
        </span>
      </div>
      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-3`}>
        {prestamo.libroAutor}
      </p>
      <div className={`flex items-center gap-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-3`}>
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
          className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-sm"
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
  darkMode,
  card,
  text,
  border,
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
      <div className="flex items-center justify-between">
        <h2 className={`text-2xl font-bold ${text}`}>Biblioteca Digital</h2>
        <div className={`flex items-center gap-2 px-4 py-2 ${card} rounded-lg border ${border}`}>
          <Book className="text-blue-500" size={20} />
          <span className={`text-sm ${text}`}>
            {stats.librosDisponibles} de {stats.totalLibros} disponibles
          </span>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`${card} rounded-lg shadow p-4 border ${border}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Libros</p>
              <p className={`text-2xl font-bold ${text}`}>{stats.totalLibros}</p>
            </div>
            <BookOpen className="text-blue-500" size={32} />
          </div>
        </div>
        <div className={`${card} rounded-lg shadow p-4 border ${border}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Disponibles</p>
              <p className={`text-2xl font-bold text-green-500`}>{stats.librosDisponibles}</p>
            </div>
            <CheckCircle className="text-green-500" size={32} />
          </div>
        </div>
        <div className={`${card} rounded-lg shadow p-4 border ${border}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Préstamos Activos</p>
              <p className={`text-2xl font-bold text-blue-500`}>{stats.prestamosActivos}</p>
            </div>
            <Clock className="text-blue-500" size={32} />
          </div>
        </div>
        <div className={`${card} rounded-lg shadow p-4 border ${border}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Vencidos</p>
              <p className={`text-2xl font-bold text-red-500`}>{stats.prestamosVencidos}</p>
            </div>
            <AlertCircle className="text-red-500" size={32} />
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
              : darkMode
              ? 'text-gray-400 hover:text-gray-200'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Catálogo
        </button>
        <button
          onClick={() => setActiveTab('prestamos')}
          className={`px-6 py-3 font-medium transition relative ${
            activeTab === 'prestamos'
              ? 'border-b-2 border-blue-500 text-blue-500'
              : darkMode
              ? 'text-gray-400 hover:text-gray-200'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Mis Préstamos
          {stats.prestamosActivos > 0 && (
            <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
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
              darkMode={darkMode}
              border={border}
              text={text}
            />
            <div className="flex items-center gap-3">
              <Filter className={darkMode ? 'text-gray-400' : 'text-gray-600'} size={20} />
              <CategoryFilter
                categories={categories}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                darkMode={darkMode}
                text={text}
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
                  darkMode={darkMode}
                  card={card}
                  text={text}
                  border={border}
                  onSolicitarPrestamo={() => solicitarPrestamo(libro.id)}
                  onReservar={() => reservarLibro(libro.id)}
                />
              ))
            ) : (
              <div className={`${card} rounded-lg shadow p-12 text-center border ${border}`}>
                <BookOpen size={64} className={`mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                <h3 className={`text-xl font-bold ${text} mb-2`}>No se encontraron libros</h3>
                <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
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
                  darkMode={darkMode}
                  card={card}
                  text={text}
                  border={border}
                  onDevolver={() => devolverLibro(prestamo.id)}
                />
              ))
          ) : (
            <div className={`${card} rounded-lg shadow p-12 text-center border ${border}`}>
              <Clock size={64} className={`mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
              <h3 className={`text-xl font-bold ${text} mb-2`}>No tienes préstamos activos</h3>
              <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                Ve al catálogo para solicitar un préstamo
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
