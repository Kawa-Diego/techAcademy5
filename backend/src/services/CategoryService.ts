import type {
  Category,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from '@ecommerce/shared';
import type { PaginatedResult, PaginationQuery } from '@ecommerce/shared';
import { AppError } from '../errors/AppError';
import { toCategory } from '../mappers/categoryMapper';
import { CategoryModel } from '../models/CategoryModel';
import { buildPaginated } from '../utils/paginated';

export class CategoryService {
  private readonly categories = new CategoryModel();

  /** Lista todas as categorias (uso público: vitrine). */
  public async listAllPublic(): Promise<Category[]> {
    const rows = await this.categories.listAllByName();
    return rows.map(toCategory);
  }

  public async list(
    pagination: PaginationQuery
  ): Promise<PaginatedResult<Category>> {
    const { rows, total } = await this.categories.list(pagination);
    const data = rows.map(toCategory);
    return buildPaginated(data, total, pagination.page, pagination.pageSize);
  }

  public async getById(id: string): Promise<Category> {
    const row = await this.requireCategory(id);
    return toCategory(row);
  }

  public async create(body: CreateCategoryPayload): Promise<Category> {
    const row = await this.categories.create(body);
    return toCategory(row);
  }

  public async update(
    id: string,
    body: UpdateCategoryPayload
  ): Promise<Category> {
    await this.requireCategory(id);
    const row = await this.categories.update(id, body);
    return toCategory(row);
  }

  public async delete(id: string): Promise<void> {
    await this.requireCategory(id);
    await this.categories.delete(id);
  }

  private async requireCategory(id: string) {
    const row = await this.categories.findById(id);
    if (!row) throw new AppError(404, 'Categoria não encontrada');
    return row;
  }
}
