import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreatePostDto, UpdatePostDto, CreateCommentDto, QueryPostsDto } from './dto';

const AUTOR_SELECT = {
  select: { id: true, firstName: true, lastName: true, avatarUrl: true, role: true },
} as const;

const STAFF_ROLES = ['TENANT_ADMIN', 'SUPER_ADMIN'];

@Injectable()
export class CommunityService {
  private readonly logger = new Logger(CommunityService.name);

  constructor(private prisma: PrismaService) {}

  /** Añade a cada post el número de likes y si el usuario actual ya dio like. */
  private decorate(posts: any[], userId: string) {
    return posts.map((post) => ({
      ...post,
      totalLikes: post._count?.likes ?? 0,
      totalComentarios: post._count?.comments ?? 0,
      liked: (post.likes ?? []).some((l: any) => l.userId === userId),
      likes: undefined,
      _count: undefined,
    }));
  }

  async create(tenantId: string, autorId: string, dto: CreatePostDto) {
    const post = await this.prisma.communityPost.create({
      data: {
        tenantId,
        autorId,
        contenido: dto.contenido,
        imagenUrl: dto.imagenUrl,
        categoria: dto.categoria ?? 'general',
      },
      include: {
        autor: AUTOR_SELECT,
        _count: { select: { likes: true, comments: true } },
        likes: { select: { userId: true } },
      },
    });

    return this.decorate([post], autorId)[0];
  }

  async findAll(tenantId: string, userId: string, query: QueryPostsDto) {
    const where: Prisma.CommunityPostWhereInput = { tenantId };

    if (query.categoria) where.categoria = query.categoria;
    if (query.search) {
      where.contenido = { contains: query.search, mode: 'insensitive' };
    }

    const posts = await this.prisma.communityPost.findMany({
      where,
      include: {
        autor: AUTOR_SELECT,
        _count: { select: { likes: true, comments: true } },
        likes: { select: { userId: true } },
        comments: {
          include: { autor: AUTOR_SELECT },
          orderBy: { createdAt: 'asc' },
          take: 3,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return this.decorate(posts, userId);
  }

  async findOne(tenantId: string, id: string, userId: string) {
    const post = await this.prisma.communityPost.findFirst({
      where: { id, tenantId },
      include: {
        autor: AUTOR_SELECT,
        _count: { select: { likes: true, comments: true } },
        likes: { select: { userId: true } },
        comments: { include: { autor: AUTOR_SELECT }, orderBy: { createdAt: 'asc' } },
      },
    });

    if (!post) {
      throw new NotFoundException('Publicacion no encontrada');
    }

    return this.decorate([post], userId)[0];
  }

  private async getPostOrFail(tenantId: string, id: string) {
    const post = await this.prisma.communityPost.findFirst({
      where: { id, tenantId },
      select: { id: true, autorId: true },
    });

    if (!post) {
      throw new NotFoundException('Publicacion no encontrada');
    }

    return post;
  }

  private assertCanModify(autorId: string, userId: string, role: string) {
    if (autorId !== userId && !STAFF_ROLES.includes(role)) {
      throw new ForbiddenException('No tienes permisos sobre esta publicacion');
    }
  }

  async update(
    tenantId: string,
    id: string,
    dto: UpdatePostDto,
    userId: string,
    role: string,
  ) {
    const post = await this.getPostOrFail(tenantId, id);
    this.assertCanModify(post.autorId, userId, role);

    await this.prisma.communityPost.update({ where: { id }, data: dto });

    return this.findOne(tenantId, id, userId);
  }

  async remove(tenantId: string, id: string, userId: string, role: string) {
    const post = await this.getPostOrFail(tenantId, id);
    this.assertCanModify(post.autorId, userId, role);

    await this.prisma.communityPost.delete({ where: { id } });

    return { message: 'Publicacion eliminada correctamente' };
  }

  /** Alterna el like del usuario sobre la publicacion. */
  async toggleLike(tenantId: string, id: string, userId: string) {
    await this.getPostOrFail(tenantId, id);

    const existing = await this.prisma.communityLike.findUnique({
      where: { postId_userId: { postId: id, userId } },
      select: { id: true },
    });

    if (existing) {
      await this.prisma.communityLike.delete({ where: { id: existing.id } });
    } else {
      await this.prisma.communityLike.create({
        data: { tenantId, postId: id, userId },
      });
    }

    return this.findOne(tenantId, id, userId);
  }

  async addComment(tenantId: string, id: string, userId: string, dto: CreateCommentDto) {
    await this.getPostOrFail(tenantId, id);

    await this.prisma.communityComment.create({
      data: { tenantId, postId: id, autorId: userId, contenido: dto.contenido },
    });

    return this.findOne(tenantId, id, userId);
  }

  async removeComment(tenantId: string, commentId: string, userId: string, role: string) {
    const comment = await this.prisma.communityComment.findFirst({
      where: { id: commentId, tenantId },
      select: { id: true, autorId: true, postId: true },
    });

    if (!comment) {
      throw new NotFoundException('Comentario no encontrado');
    }

    this.assertCanModify(comment.autorId, userId, role);

    await this.prisma.communityComment.delete({ where: { id: commentId } });

    return this.findOne(tenantId, comment.postId, userId);
  }
}
