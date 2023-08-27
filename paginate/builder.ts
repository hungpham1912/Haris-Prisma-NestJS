import {
  DirectionType,
  FindOptionsField,
  FindOptionsFields,
  Operator,
} from './models/paginate';
import { PrismaClient } from '@prisma/client';

export class PaginateBuilder<T> {
  repository;
  findOrClause;
  findAndClause;
  joinSelect;
  selectFields;
  private sort: {
    [field: string]: DirectionType;
  }[];

  public constructor(
    nameEntity: FindOptionsField<PrismaClient>,
    repository: PrismaClient,
  ) {
    this.repository = repository[nameEntity];
    this.sort = [];
  }
  add(
    colum: FindOptionsField<T> | string,
    value,
    condition: boolean,
    operator: Operator,
  ) {
    if (condition) {
      this.findAndClause = buildQuery(
        this.findAndClause,
        colum,
        value,
        operator,
      );
    }
    return this;
  }
  sortBy(field: FindOptionsField<T>, direction: DirectionType) {
    if (!direction || !field) return this;
    else this.sort.push({ [field]: direction });
    return this;
  }
  include(joinSelect) {
    this.joinSelect = joinSelect;
    return this;
  }
  select(selectFields) {
    this.selectFields = selectFields;
    return this;
  }
  async execute(
    page?: number,
    limit?: number,
  ): Promise<{ total: number; results: T[] | any[] }> {
    const [data, totalItems] = await Promise.all([
      this.repository.findMany({
        where: { OR: this.findOrClause, AND: this.findAndClause },
        orderBy: this.sort.length > 0 ? this.sort : { createdAt: 'desc' },
        ...this.buildScope(page, limit),
      }),
      this.repository.count({
        where: { OR: this.findOrClause, AND: this.findAndClause },
      }),
    ]);

    return page && limit
      ? {
          data,
          metaData: {
            totalItems,
            totalCurrentItems: data.length,
            totalPages: Math.ceil(totalItems / limit),
          },
        }
      : data;
  }
  private buildScope(page?: number, limit?: number) {
    let scope;
    if (page && limit)
      scope = {
        skip: Number((page - 1) * limit),
        take: Number(limit),
      };
    if (this.joinSelect) scope = { ...scope, include: this.joinSelect };
    if (this.selectFields) scope = { ...scope, select: this.selectFields };
    return scope;
  }
}

export function buildQuery(
  findClause,
  colum,
  value,
  operator: Operator,
): { query: any; queryStr: string } {
  let query = null;
  switch (operator) {
    case 'GT':
      query = { [colum]: { gt: value } };
      break;
    case 'GTE':
      query = { [colum]: { gte: value } };
      break;
    case 'LT':
      query = { [colum]: { lt: value } };
      break;
    case 'LTE':
      query = { [colum]: { lte: value } };
      break;
    case 'EQ':
      query = { [colum]: { equals: value } };
      break;
    case 'IN':
      query = { [colum]: { in: value } };
      break;
    case 'BETWEEN':
      query = { [colum]: { gte: value.value_from, lte: value.value_to } };
      break;
    case 'LIKE':
      query = { [colum]: { contains: value } };
      break;
    case 'LIKE_RIGHT':
      query = {
        [colum]: { startsWith: value },
      };
      break;
    case 'LIKE_LEFT':
      query = { [colum]: { endsWith: value } };
    case 'NORMAL':
      query = { [colum]: value };
      break;
  }

  return { ...findClause, ...query };
}

export function buildValueForSearchText<T>(
  fields: FindOptionsFields<T>,
  type: 'contains' | 'startsWith' | 'endsWith',
  value: string,
) {
  return fields.map((field) => {
    return { [field]: { [type]: value } };
  });
}


export function selectFields<T>(fields: FindOptionsFields<T>) {
  let data;
  fields.forEach((field) => {
    data[field] = true;
  });
  return data;
}
