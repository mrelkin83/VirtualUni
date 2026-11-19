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
  darLike: (postId: string | number) => void;
  comentar: (postId: string | number, contenido: string) => void;
  compartir: (postId: string | number) => void;
  crearPost: (contenido: string, imagenes?: string[]) => void;
}

// Componente de Post
const PostCard: React.FC<{
  post: ComunidadPost;
  darLike: (id: string | number) => void;
  comentar: (id: string | number, contenido: string) => void;
  compartir: (id: string | number) => void;
}> = ({ post, darLike, comentar, compartir }) => {
  const [mostrarComentarios, setMostrarComentarios] = useState(false);
  const [nuevoComentario, setNuevoComentario] = useState('');

  const handleComentar = () => {
    if (nuevoComentario.trim()) {
      comentar(post.id, nuevoComentario);
      setNuevoComentario('');
    }
  };

  return (
    <div className={`bg-pn-surface rounded-lg shadow-md p-5 border border-pn-line`}>
      {/* Header del post */}
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${
          post.esProfesor ? 'bg-pn-accent-2 text-pn-accent-2-ink' : 'bg-gradient-to-br from-pn-accent to-pn-accent-hover text-pn-accent-ink'
        }`}>
          {post.avatarAutor}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className={`font-bold text-pn-ink`}>{post.autor}</h4>
            {post.esProfesor && (
              <span className="bg-pn-accent-2-soft text-pn-accent-2-text text-xs px-2 py-0.5 rounded-full font-medium">
                Profesor
              </span>
            )}
          </div>
          <div className={`text-sm text-pn-ink-2`}>
            {post.fecha}
            {post.curso && <span className="ml-2">• {post.curso}</span>}
          </div>
        </div>
      </div>

      {/* Contenido del post */}
      <p className={`text-pn-ink mb-4 whitespace-pre-wrap`}>{post.contenido}</p>

      {/* Imágenes */}
      {post.imagenes && post.imagenes.length > 0 && (
        <div className={`grid ${post.imagenes.length === 1 ? 'grid-cols-1' : 'grid-cols-2'} gap-2 mb-4`}>
          {post.imagenes.map((img, idx) => (
            <div key={idx} className={`bg-pn-surface-3 rounded-lg aspect-video flex items-center justify-center`}>
              <ImageIcon className="text-pn-muted" size={48} />
            </div>
          ))}
        </div>
      )}

      {/* Estadísticas */}
      <div className={`flex items-center gap-4 py-3 border-t border-b border-pn-line mb-3 text-sm text-pn-ink-2`}>
        <span>{post.likes} me gusta</span>
        <span>{post.comentarios} comentarios</span>
        <span>{post.compartidos} compartidos</span>
      </div>

      {/* Acciones */}
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => darLike(post.id)}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition ${
            'hover:bg-pn-surface-3'
          }`}
        >
          <Heart size={20} className="text-pn-danger" />
          <span className="text-pn-ink">Me gusta</span>
        </button>
        <button
          onClick={() => setMostrarComentarios(!mostrarComentarios)}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition ${
            'hover:bg-pn-surface-3'
          }`}
        >
          <MessageCircle size={20} className="text-pn-accent-text" />
          <span className="text-pn-ink">Comentar</span>
        </button>
        <button
          onClick={() => compartir(post.id)}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition ${
            'hover:bg-pn-surface-3'
          }`}
        >
          <Share2 size={20} className="text-pn-ok" />
          <span className="text-pn-ink">Compartir</span>
        </button>
      </div>

      {/* Sección de comentarios */}
      {mostrarComentarios && (
        <div className={`border-t border-pn-line pt-4`}>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              placeholder="Escribe un comentario..."
              value={nuevoComentario}
              onChange={(e) => setNuevoComentario(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleComentar()}
              className={`flex-1 px-3 py-2 rounded-lg border border-pn-line ${
                'bg-pn-surface text-pn-ink'
              } focus:outline-none focus:ring-2 focus:ring-pn-accent`}
            />
            <button
              onClick={handleComentar}
              className="bg-pn-accent hover:bg-pn-accent text-pn-accent-ink px-4 py-2 rounded-lg transition flex items-center gap-2"
            >
              <Send size={18} />
            </button>
          </div>
          <p className={`text-sm text-pn-ink-2`}>
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
        <h2 className={`text-2xl font-bold text-pn-ink`}>Comunidad</h2>

        <button
          onClick={() => setMostrarCrearPost(!mostrarCrearPost)}
          className="bg-pn-accent hover:bg-pn-accent text-pn-accent-ink px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition"
        >
          <PlusCircle size={20} />
          Crear publicación
        </button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`bg-pn-surface rounded-lg shadow p-4 border border-pn-line`}>
          <Users className="text-pn-accent-text mb-2" size={32} />
          <p className={`text-sm text-pn-ink-2`}>Publicaciones</p>
          <p className={`text-2xl font-bold text-pn-ink`}>{stats.totalPosts}</p>
        </div>
        <div className={`bg-pn-surface rounded-lg shadow p-4 border border-pn-line`}>
          <Heart className="text-pn-danger mb-2" size={32} />
          <p className={`text-sm text-pn-ink-2`}>Me Gusta</p>
          <p className={`text-2xl font-bold text-pn-ink`}>{stats.likesTotales}</p>
        </div>
        <div className={`bg-pn-surface rounded-lg shadow p-4 border border-pn-line`}>
          <MessageCircle className="text-pn-ok mb-2" size={32} />
          <p className={`text-sm text-pn-ink-2`}>Comentarios</p>
          <p className={`text-2xl font-bold text-pn-ink`}>{stats.comentariosTotales}</p>
        </div>
        <div className={`bg-pn-surface rounded-lg shadow p-4 border border-pn-line`}>
          <Award className="text-pn-accent-2-text mb-2" size={32} />
          <p className={`text-sm text-pn-ink-2`}>De Profesores</p>
          <p className={`text-2xl font-bold text-pn-ink`}>{stats.postsProfesores}</p>
        </div>
      </div>

      {/* Crear nueva publicación */}
      {mostrarCrearPost && (
        <div className={`bg-pn-surface rounded-lg shadow-md p-5 border border-pn-line`}>
          <h3 className={`font-bold text-pn-ink mb-3`}>Crear nueva publicación</h3>
          <textarea
            placeholder="¿Qué estás pensando?"
            value={nuevoPost}
            onChange={(e) => setNuevoPost(e.target.value)}
            rows={4}
            className={`w-full px-3 py-2 rounded-lg border border-pn-line ${
              'bg-pn-surface text-pn-ink'
            } focus:outline-none focus:ring-2 focus:ring-pn-accent mb-3`}
          />
          <div className="flex flex-wrap items-center justify-between gap-4">
            <button
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition ${
                'hover:bg-pn-surface-3'
              }`}
            >
              <ImageIcon size={20} className="text-pn-accent-text" />
              <span className={`text-sm text-pn-ink`}>Agregar imagen</span>
            </button>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setMostrarCrearPost(false)}
                className={`px-4 py-2 rounded-lg transition ${
                  'bg-pn-surface-3 hover:bg-pn-line text-pn-ink'
                }`}
              >
                Cancelar
              </button>
              <button
                onClick={handleCrearPost}
                className="bg-pn-accent hover:bg-pn-accent text-pn-accent-ink px-4 py-2 rounded-lg transition"
              >
                Publicar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFiltro('todos')}
          className={`px-4 py-2 rounded-lg transition ${
            filtro === 'todos'
              ? 'bg-pn-accent text-pn-accent-ink'
              : 'bg-pn-surface-3 text-pn-ink-2 hover:bg-pn-line'
          }`}
        >
          Todos
        </button>
        <button
          onClick={() => setFiltro('estudiantes')}
          className={`px-4 py-2 rounded-lg transition ${
            filtro === 'estudiantes'
              ? 'bg-pn-accent text-pn-accent-ink'
              : 'bg-pn-surface-3 text-pn-ink-2 hover:bg-pn-line'
          }`}
        >
          Estudiantes
        </button>
        <button
          onClick={() => setFiltro('profesores')}
          className={`px-4 py-2 rounded-lg transition ${
            filtro === 'profesores'
              ? 'bg-pn-accent text-pn-accent-ink'
              : 'bg-pn-surface-3 text-pn-ink-2 hover:bg-pn-line'
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
              darLike={darLike}
              comentar={comentar}
              compartir={compartir}
            />
          ))}
        </div>
      ) : (
        <div className={`bg-pn-surface rounded-lg shadow p-12 text-center border border-pn-line`}>
          <Users size={64} className={`mx-auto mb-4 text-pn-muted`} />
          <p className={`text-pn-ink font-bold mb-2`}>No hay publicaciones</p>
          <p className={'text-pn-ink-2'}>
            Sé el primero en compartir algo con la comunidad
          </p>
        </div>
      )}
    </div>
  );
};
