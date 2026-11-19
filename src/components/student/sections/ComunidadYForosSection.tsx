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
}) => {
  const [tabActiva, setTabActiva] = useState<'social' | 'foros'>('social');

  return (
    <div className="space-y-6">
      {/* Header con Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className={`text-2xl font-bold text-pn-ink`}>Comunidad</h2>

        <div className="flex gap-2">
          <button
            onClick={() => setTabActiva('social')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg transition font-semibold ${
              tabActiva === 'social'
                ? 'bg-pn-accent text-pn-accent-ink shadow-lg'
                : 'bg-pn-surface-3 text-pn-ink-2 hover:bg-pn-line'
            }`}
          >
            <Users size={20} />
            Social
          </button>
          <button
            onClick={() => setTabActiva('foros')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg transition font-semibold ${
              tabActiva === 'foros'
                ? 'bg-pn-accent text-pn-accent-ink shadow-lg'
                : 'bg-pn-surface-3 text-pn-ink-2 hover:bg-pn-line'
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
          darLike={darLike}
          comentar={comentar}
          compartir={compartir}
          crearPost={crearPost}
        />
      ) : (
        <ForosSection
          topicos={topicos}
          respuestas={respuestas}
          crearTopico={crearTopico}
          crearRespuesta={crearRespuesta}
        />
      )}
    </div>
  );
};
