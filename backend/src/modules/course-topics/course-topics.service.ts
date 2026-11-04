import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { SubjectsService } from '../subjects/subjects.service';
import { CurrentUserData } from '@/common/decorators/current-user.decorator';
import {
  CrearTemaDto,
  ActualizarTemaDto,
  CrearBloqueDto,
  ActualizarBloqueDto,
  CopiarTemarioDto,
} from './dto/topic.dto';

@Injectable()
export class CourseTopicsService {
  constructor(
    private prisma: PrismaService,
    private subjects: SubjectsService,
  ) {}

  private async curso(tenantId: string, courseId: string) {
    const course = await this.prisma.course.findFirst({
      where: { id: courseId, tenantId },
      select: { id: true, subjectId: true, teacherId: true },
    });
    if (!course) throw new NotFoundException('Curso no encontrado');
    return course;
  }

  /**
   * Un TEACHER solo copia contenido entre grupos que él dicta. Sin esto,
   * cualquier docente podía inyectar temas en el grupo de otro (destino) o
   * sacar el material privado de un colega (origen), con solo compartir la
   * asignatura. La administración sí puede mover entre grupos ajenos.
   */
  private async asegurarDocenteDelGrupo(
    tenantId: string,
    course: { id: string; teacherId: string },
    user: CurrentUserData,
  ) {
    if (user.role !== 'TEACHER') return;

    const docente = await this.prisma.teacher.findFirst({
      where: { id: course.teacherId, tenantId },
      select: { userId: true },
    });
    if (docente?.userId !== user.id) {
      throw new ForbiddenException(
        'Solo puede copiar contenido entre grupos que usted dicta',
      );
    }
  }

  private async tema(tenantId: string, id: string) {
    const t = await this.prisma.courseTopic.findFirst({ where: { id, tenantId } });
    if (!t) throw new NotFoundException('Tema no encontrado');
    return t;
  }

  /**
   * Un tema con subjectId es contenido maestro: solo lo edita la
   * administración o un docente habilitado como editor de la asignatura.
   * El contenido propio del grupo (courseId) conserva las reglas de siempre.
   */
  private async asegurarPermiso(
    tenantId: string,
    tema: { subjectId: string | null },
    user: CurrentUserData,
  ) {
    if (tema.subjectId) {
      await this.subjects.asegurarEditorDeContenido(tenantId, tema.subjectId, user);
    }
  }

  /**
   * Cursos matriculados del estudiante y asignaturas de esos cursos. Un
   * STUDENT solo lee el temario de sus grupos y del contenido maestro de las
   * asignaturas que cursa — sin esto, cualquier estudiante del tenant leía el
   * temario y los bloques de cualquier curso.
   */
  private async alcanceEstudiante(
    tenantId: string,
    userId: string,
  ): Promise<{ courseIds: string[]; subjectIds: string[] }> {
    const student = await this.prisma.student.findUnique({
      where: { userId },
      select: { id: true, tenantId: true },
    });
    if (!student || student.tenantId !== tenantId) {
      throw new ForbiddenException('Estudiante no encontrado');
    }

    const enrollments = await this.prisma.enrollment.findMany({
      where: { studentId: student.id },
      select: { course: { select: { id: true, subjectId: true } } },
    });

    return {
      courseIds: enrollments.map((e) => e.course.id),
      subjectIds: [
        ...new Set(
          enrollments.map((e) => e.course.subjectId).filter((s): s is string => !!s),
        ),
      ],
    };
  }

  /**
   * Temario de un grupo = contenido maestro de su asignatura (heredado,
   * primero) + temas propios del grupo. Cada tema lleva `origen` para que la
   * UI distinga lo compartido de lo propio.
   */
  async findByCourse(tenantId: string, courseId: string, user: CurrentUserData) {
    const curso = await this.curso(tenantId, courseId);

    if (user.role === 'STUDENT') {
      const { courseIds } = await this.alcanceEstudiante(tenantId, user.userId);
      if (!courseIds.includes(courseId)) {
        throw new NotFoundException('Curso no encontrado');
      }
    }

    const topics = await this.prisma.courseTopic.findMany({
      where: {
        tenantId,
        OR: [
          { courseId },
          ...(curso.subjectId ? [{ subjectId: curso.subjectId }] : []),
        ],
      },
      orderBy: { orderIndex: 'asc' },
      include: { blocks: { orderBy: { orderIndex: 'asc' } } },
    });

    // Maestro primero, cada bloque ordenado por su propio orderIndex
    const maestros = topics.filter((t) => t.subjectId);
    const propios = topics.filter((t) => !t.subjectId);
    return [...maestros, ...propios].map((t) => ({
      ...t,
      origen: t.subjectId ? ('asignatura' as const) : ('grupo' as const),
    }));
  }

  /** Temario maestro de una asignatura (para administrarlo sin pasar por un grupo). */
  async findBySubject(tenantId: string, subjectId: string, user: CurrentUserData) {
    const subject = await this.prisma.subject.findFirst({
      where: { id: subjectId, tenantId },
      select: { id: true },
    });
    if (!subject) throw new NotFoundException('Asignatura no encontrada');

    if (user.role === 'STUDENT') {
      const { subjectIds } = await this.alcanceEstudiante(tenantId, user.userId);
      if (!subjectIds.includes(subjectId)) {
        throw new NotFoundException('Asignatura no encontrada');
      }
    }

    const topics = await this.prisma.courseTopic.findMany({
      where: { tenantId, subjectId },
      orderBy: { orderIndex: 'asc' },
      include: { blocks: { orderBy: { orderIndex: 'asc' } } },
    });
    return topics.map((t) => ({ ...t, origen: 'asignatura' as const }));
  }

  async crear(tenantId: string, dto: CrearTemaDto, user: CurrentUserData) {
    // Exclusividad: un tema pertenece O a un grupo O a una asignatura
    if (!!dto.courseId === !!dto.subjectId) {
      throw new BadRequestException('Indique courseId o subjectId (exactamente uno)');
    }

    if (dto.courseId) {
      await this.curso(tenantId, dto.courseId);
    } else {
      const subject = await this.prisma.subject.findFirst({
        where: { id: dto.subjectId!, tenantId },
        select: { id: true },
      });
      if (!subject) throw new NotFoundException('Asignatura no encontrada');
      await this.subjects.asegurarEditorDeContenido(tenantId, dto.subjectId!, user);
    }

    // Si no se indica el orden, va al final del temario de su ámbito.
    const orderIndex =
      dto.orderIndex ??
      (await this.prisma.courseTopic.count({
        where: dto.courseId
          ? { tenantId, courseId: dto.courseId }
          : { tenantId, subjectId: dto.subjectId },
      }));

    return this.prisma.courseTopic.create({
      data: {
        tenantId,
        courseId: dto.courseId ?? null,
        subjectId: dto.subjectId ?? null,
        title: dto.title,
        description: dto.description,
        orderIndex,
      },
      include: { blocks: true },
    });
  }

  async actualizar(
    tenantId: string,
    id: string,
    dto: ActualizarTemaDto,
    user: CurrentUserData,
  ) {
    const tema = await this.tema(tenantId, id);
    await this.asegurarPermiso(tenantId, tema, user);
    return this.prisma.courseTopic.update({
      where: { id },
      data: dto,
      include: { blocks: { orderBy: { orderIndex: 'asc' } } },
    });
  }

  async eliminar(tenantId: string, id: string, user: CurrentUserData) {
    const tema = await this.tema(tenantId, id);
    await this.asegurarPermiso(tenantId, tema, user);
    // Los bloques caen con el tema por la cascada declarada en el esquema.
    await this.prisma.courseTopic.delete({ where: { id } });
    return { message: 'Tema eliminado' };
  }

  /**
   * Promueve un tema propio del grupo a contenido maestro de la asignatura
   * del grupo: desde entonces lo heredan todos los grupos de esa asignatura.
   */
  async promover(tenantId: string, id: string, user: CurrentUserData) {
    const tema = await this.tema(tenantId, id);
    if (!tema.courseId) {
      throw new BadRequestException('El tema ya es contenido maestro de la asignatura');
    }

    const curso = await this.curso(tenantId, tema.courseId);
    if (!curso.subjectId) {
      throw new BadRequestException(
        'El grupo no tiene asignatura de catálogo; asígnela antes de promover contenido',
      );
    }

    await this.subjects.asegurarEditorDeContenido(tenantId, curso.subjectId, user);

    const orderIndex = await this.prisma.courseTopic.count({
      where: { tenantId, subjectId: curso.subjectId },
    });

    return this.prisma.courseTopic.update({
      where: { id },
      data: { subjectId: curso.subjectId, courseId: null, orderIndex },
      include: { blocks: { orderBy: { orderIndex: 'asc' } } },
    });
  }

  /**
   * Copia el temario PROPIO de otro grupo de la misma asignatura (p. ej. el
   * del periodo anterior) como temas propios de este grupo. El contenido
   * maestro no se copia: ya se hereda.
   */
  async copiarDelGrupo(
    tenantId: string,
    dto: CopiarTemarioDto,
    user: CurrentUserData,
  ) {
    const [destino, origen] = await Promise.all([
      this.curso(tenantId, dto.courseId),
      this.curso(tenantId, dto.fromCourseId),
    ]);

    if (dto.courseId === dto.fromCourseId) {
      throw new BadRequestException('El grupo origen y el destino son el mismo');
    }
    if (!destino.subjectId || destino.subjectId !== origen.subjectId) {
      throw new BadRequestException(
        'Ambos grupos deben dictar la misma asignatura de catálogo',
      );
    }

    // Ambos grupos deben ser del docente que llama (la administración no)
    await this.asegurarDocenteDelGrupo(tenantId, destino, user);
    await this.asegurarDocenteDelGrupo(tenantId, origen, user);

    const temas = await this.prisma.courseTopic.findMany({
      where: { tenantId, courseId: dto.fromCourseId },
      orderBy: { orderIndex: 'asc' },
      include: { blocks: { orderBy: { orderIndex: 'asc' } } },
    });

    const base = await this.prisma.courseTopic.count({
      where: { tenantId, courseId: dto.courseId },
    });

    let copiados = 0;
    await this.prisma.$transaction(async (tx) => {
      for (const [i, tema] of temas.entries()) {
        const creado = await tx.courseTopic.create({
          data: {
            tenantId,
            courseId: dto.courseId,
            title: tema.title,
            description: tema.description,
            orderIndex: base + i,
          },
          select: { id: true },
        });
        if (tema.blocks.length > 0) {
          await tx.topicBlock.createMany({
            data: tema.blocks.map((b) => ({
              tenantId,
              topicId: creado.id,
              title: b.title,
              content: b.content,
              objectives: b.objectives,
              keyIdeas: b.keyIdeas,
              orderIndex: b.orderIndex,
            })),
          });
        }
        copiados++;
      }
    });

    return { message: `Se copiaron ${copiados} tema(s) del grupo anterior`, copiados };
  }

  // ------------------------------------------------------------------ bloques

  private async bloqueConTema(tenantId: string, id: string) {
    const b = await this.prisma.topicBlock.findFirst({
      where: { id, tenantId },
      include: { topic: { select: { id: true, subjectId: true } } },
    });
    if (!b) throw new NotFoundException('Bloque no encontrado');
    return b;
  }

  async crearBloque(
    tenantId: string,
    topicId: string,
    dto: CrearBloqueDto,
    user: CurrentUserData,
  ) {
    const tema = await this.tema(tenantId, topicId);
    await this.asegurarPermiso(tenantId, tema, user);

    const orderIndex =
      dto.orderIndex ??
      (await this.prisma.topicBlock.count({ where: { tenantId, topicId } }));

    return this.prisma.topicBlock.create({
      data: {
        tenantId,
        topicId,
        title: dto.title,
        content: dto.content,
        objectives: dto.objectives ?? [],
        keyIdeas: dto.keyIdeas ?? [],
        orderIndex,
      },
    });
  }

  async actualizarBloque(
    tenantId: string,
    id: string,
    dto: ActualizarBloqueDto,
    user: CurrentUserData,
  ) {
    const b = await this.bloqueConTema(tenantId, id);
    await this.asegurarPermiso(tenantId, b.topic, user);
    return this.prisma.topicBlock.update({ where: { id }, data: dto });
  }

  async eliminarBloque(tenantId: string, id: string, user: CurrentUserData) {
    const b = await this.bloqueConTema(tenantId, id);
    await this.asegurarPermiso(tenantId, b.topic, user);
    await this.prisma.topicBlock.delete({ where: { id } });
    return { message: 'Bloque eliminado' };
  }
}
