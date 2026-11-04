import React, { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Lock, ArrowUpCircle, Copy, BookOpen, FileText } from 'lucide-react';
import { gruposDocenteApi, editoresApi } from '../../../api/endpoints/academico';
import { temarioApi } from '../../../api/endpoints/course-topics';
import { materialsApi } from '../../../api/endpoints/materials';
import { useAuthStore } from '../../../store/authStore';
import { comoArreglo } from '../../../utils/respuestaApi';
import { mensajeDeError } from '../../admin/sections/academico/errores';

/** Lo que devuelven temario y materiales con el flag de origen de la fase 4. */
interface ItemDeContenido {
  id: string;
  origen?: 'asignatura' | 'grupo';
  title?: string;
  nombre?: string;
}

const nombreDe = (item: ItemDeContenido) => item.title ?? item.nombre ?? '(sin título)';

/**
 * Contenido del grupo: distingue el contenido MAESTRO de la asignatura (que
 * heredan todos sus grupos y es de solo lectura salvo que el admin haya
 * habilitado al docente como editor) del contenido PROPIO del grupo, y ofrece
 * las dos acciones de la fase 4: promover a la asignatura y copiar del grupo
 * anterior de la misma asignatura.
 *
 * Autónomo: trae sus propios datos con react-query.
 */
export function ContenidoDelGrupoPanel({ darkMode = false }: { darkMode?: boolean }) {
  const queryClient = useQueryClient();
  const usuario = useAuthStore((s) => s.user);
  const [courseId, setCourseId] = useState<string | null>(null);
  const [copiarDesde, setCopiarDesde] = useState('');

  const { data: grupos } = useQuery({
    queryKey: ['mis-grupos-docente'],
    queryFn: () => gruposDocenteApi.mios(),
  });

  // Por defecto, un grupo del periodo en curso; si no hay, el primero
  useEffect(() => {
    if (!courseId && grupos?.length) {
      const enCurso = grupos.find((g) => g.academicPeriod?.status === 'EN_CURSO');
      setCourseId((enCurso ?? grupos[0]).id);
    }
  }, [grupos, courseId]);

  const grupo = grupos?.find((g) => g.id === courseId);
  const subjectId = grupo?.subject?.id;

  // ¿Este docente puede editar el contenido maestro de la asignatura?
  // Por defecto NO: el admin lo habilita como editor (tabla subject_editors).
  const { data: editores } = useQuery({
    queryKey: ['editores-asignatura', subjectId],
    queryFn: () => editoresApi.deAsignatura(subjectId!),
    enabled: !!subjectId,
  });
  const puedoEditarMaestro = useMemo(
    () => (editores ?? []).some((e) => e.teacher.user.id === usuario?.id),
    [editores, usuario?.id],
  );

  const { data: temarioRes } = useQuery({
    queryKey: ['temario-grupo', courseId],
    queryFn: () => temarioApi.getByCourse(courseId!),
    enabled: !!courseId,
  });
  const { data: materialesRes } = useQuery({
    queryKey: ['materiales-grupo', courseId],
    queryFn: () => materialsApi.getAll({ courseId: courseId! }),
    enabled: !!courseId,
  });

  const temario: ItemDeContenido[] = comoArreglo((temarioRes as any)?.data);
  const materiales: ItemDeContenido[] = comoArreglo((materialesRes as any)?.data);

  const invalidar = () => {
    queryClient.invalidateQueries({ queryKey: ['temario-grupo', courseId] });
    queryClient.invalidateQueries({ queryKey: ['materiales-grupo', courseId] });
  };

  const promoverTema = useMutation({
    mutationFn: (id: string) => temarioApi.promoverModulo(id),
    onSuccess: invalidar,
    onError: (e) => alert(mensajeDeError(e)),
  });
  const promoverMaterial = useMutation({
    mutationFn: (id: string) => materialsApi.promover(id),
    onSuccess: invalidar,
    onError: (e) => alert(mensajeDeError(e)),
  });
  const copiar = useMutation({
    mutationFn: async (fromCourseId: string) => {
      // Las dos copias son independientes: si una falla, la otra ya se hizo,
      // así que se informan por separado en vez de fingir atomicidad.
      const temas = await temarioApi.copiarDelGrupo({ courseId: courseId!, fromCourseId });
      const mats = await materialsApi.copiarDelGrupo({ courseId: courseId!, fromCourseId });
      return { temas: temas.data.copiados, materiales: mats.data.copiados };
    },
    onSuccess: ({ temas, materiales: mats }) => {
      invalidar();
      setCopiarDesde('');
      alert(`Se copiaron ${temas} tema(s) y ${mats} material(es) del grupo elegido.`);
    },
    onError: (e) => alert(mensajeDeError(e)),
  });

  // Otros grupos MÍOS que dictan la misma asignatura (el backend solo permite
  // copiar entre grupos del propio docente y de la misma asignatura).
  const gruposCompatibles = (grupos ?? []).filter(
    (g) => g.id !== courseId && !!subjectId && g.subject?.id === subjectId,
  );

  const card = darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100';
  const texto = darkMode ? 'text-gray-100' : 'text-gray-900';
  const suave = darkMode ? 'text-gray-400' : 'text-gray-600';

  if (!grupos || grupos.length === 0) return null;

  return (
    <section className={`${card} border rounded-lg p-4 space-y-4`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className={`text-lg font-bold ${texto}`}>Contenido del grupo</h3>
        <select
          value={courseId ?? ''}
          onChange={(e) => { setCourseId(e.target.value); setCopiarDesde(''); }}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          aria-label="Elegir grupo"
        >
          {grupos.map((g) => (
            <option key={g.id} value={g.id}>
              {g.subject?.name ?? g.name}
              {g.groupCode ? ` · Grupo ${g.groupCode}` : ''}
              {g.academicPeriod ? ` · ${g.academicPeriod.code}` : ''}
            </option>
          ))}
        </select>
      </div>

      {!subjectId && (
        <p className="text-sm bg-amber-50 border border-amber-200 text-amber-800 rounded-lg p-3">
          Este grupo no tiene asignatura del catálogo, así que su contenido no se
          puede compartir con otros grupos. Pide a la administración que le asigne
          una asignatura.
        </p>
      )}

      {subjectId && !puedoEditarMaestro && (
        <p className={`text-sm ${suave}`}>
          El contenido de la asignatura <strong>{grupo?.subject?.name}</strong> lo
          administra la institución: lo ves aquí porque tu grupo lo hereda, pero no
          puedes editarlo ni promover contenido a él hasta que te habiliten como
          editor de la asignatura.
        </p>
      )}

      {/* Copiar del grupo anterior */}
      {subjectId && gruposCompatibles.length > 0 && (
        <form
          className="flex flex-wrap items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg p-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!copiarDesde) return;
            copiar.mutate(copiarDesde);
          }}
        >
          <span className="text-sm text-blue-900">Copiar el contenido propio de</span>
          <select
            value={copiarDesde}
            onChange={(e) => setCopiarDesde(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1 text-sm"
            aria-label="Grupo del que copiar"
          >
            <option value="">Seleccionar grupo...</option>
            {gruposCompatibles.map((g) => (
              <option key={g.id} value={g.id}>
                {g.academicPeriod?.code ?? g.semester ?? 'sin periodo'}
                {g.groupCode ? ` · Grupo ${g.groupCode}` : ''}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={!copiarDesde || copiar.isPending}
            className="flex items-center gap-1 text-sm bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            <Copy size={14} /> Copiar a este grupo
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ListaDeContenido
          titulo="Temario"
          icono={BookOpen}
          items={temario}
          puedoPromover={puedoEditarMaestro && !!subjectId}
          promoviendo={promoverTema.isPending}
          onPromover={(id) => promoverTema.mutate(id)}
          darkMode={darkMode}
        />
        <ListaDeContenido
          titulo="Materiales"
          icono={FileText}
          items={materiales}
          puedoPromover={puedoEditarMaestro && !!subjectId}
          promoviendo={promoverMaterial.isPending}
          onPromover={(id) => promoverMaterial.mutate(id)}
          darkMode={darkMode}
        />
      </div>
    </section>
  );
}

function ListaDeContenido({
  titulo,
  icono: Icono,
  items,
  puedoPromover,
  promoviendo,
  onPromover,
  darkMode,
}: {
  titulo: string;
  icono: React.ElementType;
  items: ItemDeContenido[];
  puedoPromover: boolean;
  promoviendo: boolean;
  onPromover: (id: string) => void;
  darkMode: boolean;
}) {
  const texto = darkMode ? 'text-gray-100' : 'text-gray-900';
  const suave = darkMode ? 'text-gray-400' : 'text-gray-600';
  const maestros = items.filter((i) => i.origen === 'asignatura');
  const propios = items.filter((i) => i.origen !== 'asignatura');

  return (
    <div>
      <h4 className={`text-sm font-semibold mb-2 flex items-center gap-1 ${texto}`}>
        <Icono size={15} /> {titulo}
      </h4>

      {items.length === 0 && <p className={`text-sm ${suave}`}>Sin contenido todavía.</p>}

      {maestros.length > 0 && (
        <>
          <p className={`text-xs uppercase tracking-wide mb-1 ${suave}`}>
            De la asignatura · se comparte
          </p>
          <ul className="space-y-1 mb-3">
            {maestros.map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-2 text-sm px-2 py-1.5 rounded bg-purple-50 text-purple-900"
              >
                <Lock size={13} className="shrink-0" aria-label="Contenido de la asignatura" />
                <span className="truncate">{nombreDe(item)}</span>
              </li>
            ))}
          </ul>
        </>
      )}

      {propios.length > 0 && (
        <>
          <p className={`text-xs uppercase tracking-wide mb-1 ${suave}`}>
            Propio de este grupo
          </p>
          <ul className="space-y-1">
            {propios.map((item) => (
              <li
                key={item.id}
                className={`flex items-center gap-2 text-sm px-2 py-1.5 rounded ${
                  darkMode ? 'bg-gray-900' : 'bg-gray-50'
                }`}
              >
                <span className={`truncate flex-1 ${texto}`}>{nombreDe(item)}</span>
                {puedoPromover && (
                  <button
                    onClick={() => {
                      if (
                        confirm(
                          `¿Promover "${nombreDe(item)}" a contenido de la asignatura? ` +
                            'Lo heredarán todos los grupos que la dictan.',
                        )
                      ) {
                        onPromover(item.id);
                      }
                    }}
                    disabled={promoviendo}
                    title="Promover a contenido de la asignatura"
                    className="shrink-0 flex items-center gap-1 text-xs text-indigo-600 hover:bg-indigo-50 px-1.5 py-0.5 rounded disabled:opacity-50"
                  >
                    <ArrowUpCircle size={13} /> Promover
                  </button>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
