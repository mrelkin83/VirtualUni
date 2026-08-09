import React, { useState } from 'react';
import {
  Heart,
  MessageCircle,
  Share2,
  Send,
  Image as ImageIcon,
  Users,
  Award,
  PlusCircle
} from 'lucide-react';
import { ComunidadPost } from '../../../types/student.types';

interface ComunidadSectionProps {
  posts: ComunidadPost[];
  darkMode: boolean;
  card: string;
  text: string;
  border: string;
  darLike: (postId: string | number) => void;
  comentar: (postId: string | number, contenido: string) => void;
  compartir: (postId: string | number) => void;
  crearPost: (contenido: string, imagenes?: string[]) => void;
}

// Componente de Post
const PostCard: React.FC<{
  post: ComunidadPost;
  darkMode: boolean;
  card: string;
  text: string;
  border: string;
  darLike: (id: string | number) => void;
  comentar: (id: string | number, contenido: string) => void;
  compartir: (id: string | number) => void;
}> = ({ post, darkMode, card, text, border, darLike, comentar, compartir }) => {
  const [mostrarComentarios, setMostrarComentarios] = useState(false);
  const [nuevoComentario, setNuevoComentario] = useState('');

  const handleComentar = () => {
    if (nuevoComentario.trim()) {
      comentar(post.id, nuevoComentario);
      setNuevoComentario('');
    }
  };

  return (
    <div className={`${card} rounded-lg shadow-md p-5 border ${border}`}>
      {/* Header del post */}
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white ${
          post.esProfesor ? 'bg-gradient-to-br from-purple-500 to-purple-700' : 'bg-gradient-to-br from-blue-500 to-blue-700'
        }`}>
          {post.avatarAutor}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className={`font-bold ${text}`}>{post.autor}</h4>
            {post.esProfesor && (
              <span className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 text-xs px-2 py-0.5 rounded-full font-medium">
                Profesor
              </span>
            )}
          </div>
          <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {post.fecha}
            {post.curso && <span className="ml-2">• {post.curso}</span>}
          </div>
        </div>
      </div>

      {/* Contenido del post */}
      <p className={`${text} mb-4 whitespace-pre-wrap`}>{post.contenido}</p>

      {/* Imágenes */}
      {post.imagenes && post.imagenes.length > 0 && (
        <div className={`grid ${post.imagenes.length === 1 ? 'grid-cols-1' : 'grid-cols-2'} gap-2 mb-4`}>
          {post.imagenes.map((img, idx) => (
            <div key={idx} className={`bg-gray-200 dark:bg-gray-700 rounded-lg aspect-video flex items-center justify-center`}>
              <ImageIcon className="text-gray-400" size={48} />
            </div>
          ))}
        </div>
      )}

      {/* Estadísticas */}
      <div className={`flex items-center gap-4 py-3 border-t border-b ${border} mb-3 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        <span>{post.likes} me gusta</span>
        <span>{post.comentarios} comentarios</span>
        <span>{post.compartidos} compartidos</span>
      </div>

      {/* Acciones */}
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => darLike(post.id)}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition ${
            darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
          }`}
        >
          <Heart size={20} className="text-red-500" />
          <span className={text}>Me gusta</span>
        </button>
        <button
          onClick={() => setMostrarComentarios(!mostrarComentarios)}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition ${
            darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
          }`}
        >
          <MessageCircle size={20} className="text-blue-500" />
          <span className={text}>Comentar</span>
        </button>
        <button
          onClick={() => compartir(post.id)}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition ${
            darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
          }`}
        >
          <Share2 size={20} className="text-green-500" />
          <span className={text}>Compartir</span>
        </button>
      </div>

      {/* Sección de comentarios */}
      {mostrarComentarios && (
        <div className={`border-t ${border} pt-4`}>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              placeholder="Escribe un comentario..."
              value={nuevoComentario}
              onChange={(e) => setNuevoComentario(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleComentar()}
              className={`flex-1 px-3 py-2 rounded-lg border ${border} ${
                darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            <button
              onClick={handleComentar}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition flex items-center gap-2"
            >
              <Send size={18} />
            </button>
          </div>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {post.comentarios} comentario{post.comentarios !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  );
};

// Componente Principal
export const ComunidadSection: React.FC<ComunidadSectionProps> = ({
  posts,
  darkMode,
  card,
  text,
  border,
  darLike,
  comentar,
  compartir,
  crearPost
}) => {
  const [filtro, setFiltro] = useState<'todos' | 'estudiantes' | 'profesores'>('todos');
  const [nuevoPost, setNuevoPost] = useState('');
  const [mostrarCrearPost, setMostrarCrearPost] = useState(false);

  // Filtrar posts
  const postsFiltrados = posts.filter(post => {
    if (filtro === 'estudiantes') return !post.esProfesor;
    if (filtro === 'profesores') return post.esProfesor;
    return true;
  });

  // Estadísticas
  const stats = {
    totalPosts: posts.length,
    likesTotales: posts.reduce((acc, post) => acc + post.likes, 0),
    comentariosTotales: posts.reduce((acc, post) => acc + post.comentarios, 0),
    postsProfesores: posts.filter(p => p.esProfesor).length,
  };

  const handleCrearPost = () => {
    if (nuevoPost.trim()) {
      crearPost(nuevoPost);
      setNuevoPost('');
      setMostrarCrearPost(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className={`text-2xl font-bold ${text}`}>Comunidad</h2>

        <button
          onClick={() => setMostrarCrearPost(!mostrarCrearPost)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition"
        >
          <PlusCircle size={20} />
          Crear publicación
        </button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`${card} rounded-lg shadow p-4 border ${border}`}>
          <Users className="text-blue-500 mb-2" size={32} />
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Publicaciones</p>
          <p className={`text-2xl font-bold ${text}`}>{stats.totalPosts}</p>
        </div>
        <div className={`${card} rounded-lg shadow p-4 border ${border}`}>
          <Heart className="text-red-500 mb-2" size={32} />
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Me Gusta</p>
          <p className={`text-2xl font-bold ${text}`}>{stats.likesTotales}</p>
        </div>
        <div className={`${card} rounded-lg shadow p-4 border ${border}`}>
          <MessageCircle className="text-green-500 mb-2" size={32} />
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Comentarios</p>
          <p className={`text-2xl font-bold ${text}`}>{stats.comentariosTotales}</p>
        </div>
        <div className={`${card} rounded-lg shadow p-4 border ${border}`}>
          <Award className="text-purple-500 mb-2" size={32} />
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>De Profesores</p>
          <p className={`text-2xl font-bold ${text}`}>{stats.postsProfesores}</p>
        </div>
      </div>

      {/* Crear nueva publicación */}
      {mostrarCrearPost && (
        <div className={`${card} rounded-lg shadow-md p-5 border ${border}`}>
          <h3 className={`font-bold ${text} mb-3`}>Crear nueva publicación</h3>
          <textarea
            placeholder="¿Qué estás pensando?"
            value={nuevoPost}
            onChange={(e) => setNuevoPost(e.target.value)}
            rows={4}
            className={`w-full px-3 py-2 rounded-lg border ${border} ${
              darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
            } focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3`}
          />
          <div className="flex items-center justify-between">
            <button
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition ${
                darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
              }`}
            >
              <ImageIcon size={20} className="text-blue-500" />
              <span className={`text-sm ${text}`}>Agregar imagen</span>
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => setMostrarCrearPost(false)}
                className={`px-4 py-2 rounded-lg transition ${
                  darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                }`}
              >
                Cancelar
              </button>
              <button
                onClick={handleCrearPost}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition"
              >
                Publicar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="flex gap-2">
        <button
          onClick={() => setFiltro('todos')}
          className={`px-4 py-2 rounded-lg transition ${
            filtro === 'todos'
              ? 'bg-blue-500 text-white'
              : darkMode
              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Todos
        </button>
        <button
          onClick={() => setFiltro('estudiantes')}
          className={`px-4 py-2 rounded-lg transition ${
            filtro === 'estudiantes'
              ? 'bg-blue-500 text-white'
              : darkMode
              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Estudiantes
        </button>
        <button
          onClick={() => setFiltro('profesores')}
          className={`px-4 py-2 rounded-lg transition ${
            filtro === 'profesores'
              ? 'bg-blue-500 text-white'
              : darkMode
              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Profesores
        </button>
      </div>

      {/* Feed de publicaciones */}
      {postsFiltrados.length > 0 ? (
        <div className="space-y-4">
          {postsFiltrados.map(post => (
            <PostCard
              key={post.id}
              post={post}
              darkMode={darkMode}
              card={card}
              text={text}
              border={border}
              darLike={darLike}
              comentar={comentar}
              compartir={compartir}
            />
          ))}
        </div>
      ) : (
        <div className={`${card} rounded-lg shadow p-12 text-center border ${border}`}>
          <Users size={64} className={`mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
          <p className={`${text} font-bold mb-2`}>No hay publicaciones</p>
          <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
            Sé el primero en compartir algo con la comunidad
          </p>
        </div>
      )}
    </div>
  );
};
