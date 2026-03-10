import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { SearchQueryDto, SearchResponse, SearchResultItem } from './dto';

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async search(dto: SearchQueryDto): Promise<SearchResponse> {
    const tsQuery = dto.q
      .split(/\s+/)
      .map((w) => w + ':*')
      .join(' & ');
    const limit = dto.limit ? parseInt(dto.limit, 10) : 10;
    const types = dto.type ? dto.type.split(',').map((t) => t.trim().toLowerCase()) : null;

    const result: SearchResponse = {
      contacts: [],
      companies: [],
      deals: [],
      tickets: [],
    };

    if (!types || types.includes('contacts')) {
      const contacts = await this.prisma.$queryRaw<
        { id: string; firstName: string; lastName: string; email: string }[]
      >`
        SELECT id, "firstName", "lastName", email
        FROM contacts
        WHERE to_tsvector('english', "firstName" || ' ' || "lastName" || ' ' || COALESCE(email, ''))
              @@ to_tsquery('english', ${tsQuery})
        LIMIT ${limit}
      `;
      result.contacts = contacts.map((c) => ({
        id: c.id,
        title: `${c.firstName} ${c.lastName}`,
        subtitle: c.email,
        entityType: 'contact',
        url: `/contacts/${c.id}`,
      }));
    }

    if (!types || types.includes('companies')) {
      const companies = await this.prisma.$queryRaw<
        { id: string; name: string; domain: string | null }[]
      >`
        SELECT id, name, domain
        FROM companies
        WHERE to_tsvector('english', name || ' ' || COALESCE(domain, ''))
              @@ to_tsquery('english', ${tsQuery})
        LIMIT ${limit}
      `;
      result.companies = companies.map((c) => ({
        id: c.id,
        title: c.name,
        subtitle: c.domain || undefined,
        entityType: 'company',
        url: `/companies/${c.id}`,
      }));
    }

    if (!types || types.includes('deals')) {
      const deals = await this.prisma.$queryRaw<
        { id: string; name: string; amount: number }[]
      >`
        SELECT id, name, amount
        FROM deals
        WHERE to_tsvector('english', name)
              @@ to_tsquery('english', ${tsQuery})
        LIMIT ${limit}
      `;
      result.deals = deals.map((d) => ({
        id: d.id,
        title: d.name,
        subtitle: String(d.amount),
        entityType: 'deal',
        url: `/deals/${d.id}`,
      }));
    }

    if (!types || types.includes('tickets')) {
      const tickets = await this.prisma.$queryRaw<
        { id: string; subject: string; status: string }[]
      >`
        SELECT id, subject, status
        FROM tickets
        WHERE to_tsvector('english', subject)
              @@ to_tsquery('english', ${tsQuery})
        LIMIT ${limit}
      `;
      result.tickets = tickets.map((t) => ({
        id: t.id,
        title: t.subject,
        subtitle: t.status,
        entityType: 'ticket',
        url: `/tickets/${t.id}`,
      }));
    }

    return result;
  }
}
