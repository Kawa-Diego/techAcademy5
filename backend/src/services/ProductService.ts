import type {
  CreateProductPayload,
  PaginatedResult,
  PaginationQuery,
  Product,
  PublicProduct,
  UpdateProductPayload,
} from '@ecommerce/shared';
import { AppError } from '../errors/AppError';
import { toPublicProduct } from '../mappers/publicProductMapper';
import { toProduct } from '../mappers/productMapper';
import { CategoryModel } from '../models/CategoryModel';
import { ProductModel } from '../models/ProductModel';
import { buildPaginated } from '../utils/paginated';

export class ProductService {
  private readonly products = new ProductModel();
  private readonly categories = new CategoryModel();

  public async list(
    pagination: PaginationQuery
  ): Promise<PaginatedResult<Product>> {
    const { rows, total } = await this.products.list(pagination);
    const data = rows.map(toProduct);
    return buildPaginated(data, total, pagination.page, pagination.pageSize);
  }

  public async listPublic(
    pagination: PaginationQuery,
    categoryId?: string
  ): Promise<PaginatedResult<PublicProduct>> {
    const { rows, total } = await this.products.listWithCategory(pagination, {
      categoryId:
        categoryId !== undefined && categoryId.length > 0 ? categoryId : undefined,
    });
    const data = rows.map((r) => toPublicProduct(r));
    return buildPaginated(data, total, pagination.page, pagination.pageSize);
  }

  public async getByIdPublic(id: string): Promise<PublicProduct> {
    const row = await this.products.findByIdWithCategory(id);
    if (!row) throw new AppError(404, 'Product not found');
    return toPublicProduct(row);
  }

  public async getById(id: string): Promise<Product> {
    const row = await this.requireProduct(id);
    return toProduct(row);
  }

  public async create(body: CreateProductPayload): Promise<Product> {
    await this.requireCategory(body.categoryId);
    const row = await this.products.create({
      ...body,
      imageUrls: [...body.imageUrls],
    });
    return toProduct(row);
  }

  public async update(
    id: string,
    body: UpdateProductPayload
  ): Promise<Product> {
    await this.requireProduct(id);
    await this.requireCategory(body.categoryId);
    const row = await this.products.update(id, {
      ...body,
      imageUrls: [...body.imageUrls],
    });
    return toProduct(row);
  }

  public async delete(id: string): Promise<void> {
    await this.requireProduct(id);
    await this.products.delete(id);
  }

  private async requireCategory(id: string): Promise<void> {
    const row = await this.categories.findById(id);
    if (!row) throw new AppError(404, 'Category not found');
  }

  private async requireProduct(id: string) {
    const row = await this.products.findById(id);
    if (!row) throw new AppError(404, 'Product not found');
    return row;
  }
}
