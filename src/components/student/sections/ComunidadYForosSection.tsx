import React, { useState } from 'react';
import { Users, MessageSquare } from 'lucide-react';
import { ForosSection } from './ForosSection';
import { ComunidadSection } from './ComunidadSection';
import { ForumTopic, ForumReply, ComunidadPost } from '../../../types/student.types';

interface ComunidadYForosSectionProps {
  // Props para Foros
  topicos: ForumTopic[];
  respuestas: ForumReply[];
  crearTopico: (titulo: string, descripcion: string, categoria: string, curso: string) => void;
  crearRespuesta: (topicoId: number, contenido: string) => void;

  // Props para Comunidad
  posts: ComunidadPost[];
  darLike: (postId: string | number) => void;
  comentar: (postId: number, contenido: string) => void;
  compartir: (postId: string | number) => void;
  crearPost: (contenido: string, imagenes?: string[]) => void;

  // Props comunes
  darkMode: boolean;
  card: string;
  text: string;
  border: string;
}

export const ComunidadYForosSection: React.FC<ComunidadYForosSectionProps> = ({
  topicos,
  respuestas,
  crearTopico,
  crearRespuesta,
  posts,
  darLike,
  comentar,
  compartir,
  crearPost,
  darkMode,
  card,
  text,
  border
}) => {
  const [tabActiva, setTabActiva] = useState<'social' | 'foros'>('social');

  return (
    <div className="space-y-6">
      {/* Header con Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className={`text-2xl font-bold ${text}`}>Comunidad</h2>

        <div className="flex gap-2">
          <button
            onClick={() => setTabActiva('social')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg transition font-semibold ${
              tabActiva === 'social'
                ? 'bg-blue-500 text-white shadow-lg'
                : darkMode
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <Users size={20} />
            Social
          </button>
          <button
            onClick={() => setTabActiva('foros')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg transition font-semibold ${
              tabActiva === 'foros'
                ? 'bg-blue-500 text-white shadow-lg'
                : darkMode
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <MessageSquare size={20} />
            Foros Académicos
          </button>
        </div>
      </div>

      {/* Contenido según tab activa */}
      {tabActiva === 'social' ? (
        <ComunidadSection
          posts={posts}
          darkMode={darkMode}
          card={card}
          text={text}
          border={border}
          darLike={darLike}
          comentar={comentar}
          compartir={compartir}
          crearPost={crearPost}
        />
      ) : (
        <ForosSection
          topicos={topicos}
          respuestas={respuestas}
          darkMode={darkMode}
          card={card}
          text={text}
          border={border}
          crearTopico={crearTopico}
          crearRespuesta={crearRespuesta}
        />
      )}
    </div>
  );
};
