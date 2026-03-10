import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateCompanyDto, UpdateCompanyDto, CompanyQueryDto } from './dto';

const companyInclude = {
  owner: {
    select: { id: true, firstName: true, lastName: true, email: true },
  },
  _count: { select: { contacts: true } },
};

@Injectable()
export class CompaniesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCompanyDto, userId: string) {
    try {
      return await this.prisma.company.create({
        data: {
          name: dto.name,
          domain: dto.domain,
          industry: dto.industry,
          size: dto.size,
          ownerId: userId,
        },
        include: companyInclude,
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictException(
          'A company with this domain already exists',
        );
      }
      throw error;
    }
  }

  async findAll(query: CompanyQueryDto) {
    const { page = 1, limit = 25, sort, search, industry, ownerId } = query;
    const skip = (page - 1) * limit;

    if (search) {
      const searchQuery = search.split(/\s+/).join(' & ');
      const data = await this.prisma.$queryRawUnsafe(
        `SELECT c.*,
                ts_rank(c.search_vector, to_tsquery('english', $1)) as rank
         FROM companies c
         WHERE c.search_vector @@ to_tsquery('english', $1)
         ${industry ? `AND c.industry = $4` : ''}
         ${ownerId ? `AND c."ownerId" = $${industry ? 5 : 4}` : ''}
         ORDER BY rank DESC
         LIMIT $2 OFFSET $3`,
        searchQuery,
        limit,
        skip,
        ...(industry ? [industry] : []),
        ...(ownerId ? [ownerId] : []),
      );

      const countResult: any[] = await this.prisma.$queryRawUnsafe(
        `SELECT COUNT(*) as count FROM companies c
         WHERE c.search_vector @@ to_tsquery('english', $1)
         ${industry ? `AND c.industry = $2` : ''}
         ${ownerId ? `AND c."ownerId" = $${industry ? 3 : 2}` : ''}`,
        searchQuery,
        ...(industry ? [industry] : []),
        ...(ownerId ? [ownerId] : []),
      );
      const total = Number(countResult[0]?.count || 0);

      return { data, meta: { total, page, limit } };
    }

    const where: any = {};
    if (industry) where.industry = industry;
    if (ownerId) where.ownerId = ownerId;

    let orderBy: any = { createdAt: 'desc' };
    if (sort) {
      const [field, direction] = sort.split(':');
      if (field && (direction === 'asc' || direction === 'desc')) {
        orderBy = { [field]: direction };
      }
    }

    const [data, total] = await Promise.all([
      this.prisma.company.findMany({
        where,
        include: companyInclude,
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.company.count({ where }),
    ]);

    return { data, meta: { total, page, limit } };
  }

  async findById(id: string) {
    const company = await this.prisma.company.findUnique({
      where: { id },
      include: {
        ...companyInclude,
        contacts: {
          take: 20,
          orderBy: { createdAt: 'desc' },
        },
        activities: {
          orderBy: { occurredAt: 'desc' },
          take: 20,
        },
      },
    });
    if (!company) {
      throw new NotFoundException('Company not found');
    }
    return company;
  }

  async update(id: string, dto: UpdateCompanyDto) {
    const existing = await this.prisma.company.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException('Company not found');
    }

    try {
      return await this.prisma.company.update({
        where: { id },
        data: dto as any,
        include: companyInclude,
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictException(
          'A company with this domain already exists',
        );
      }
      throw error;
    }
  }

  async remove(id: string) {
    const existing = await this.prisma.company.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException('Company not found');
    }

    await this.prisma.company.delete({ where: { id } });
  }
}
