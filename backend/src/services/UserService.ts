import {
  formatDisplayName,
  type PaginatedResult,
  type PaginationQuery,
  type UpdateUserPayload,
  type UserPublic,
} from '@ecommerce/shared';
import { AppError } from '../errors/AppError';
import { toUserPublic } from '../mappers/userMapper';
import { UserModel } from '../models/UserModel';
import { assertValidCpf } from '../utils/cpf';
import { assertStrongPassword } from '../utils/password';
import { buildPaginated } from '../utils/paginated';
import { hashPassword } from '../utils/cryptoPassword';

const normalizeCpf = (raw: string): string => raw.replace(/\D/g, '');

export class UserService {
  private readonly users = new UserModel();

  public async list(
    pagination: PaginationQuery
  ): Promise<PaginatedResult<UserPublic>> {
    const { rows, total } = await this.users.list(pagination);
    const data = rows.map(toUserPublic);
    return buildPaginated(data, total, pagination.page, pagination.pageSize);
  }

  public async getByIdAny(targetId: string): Promise<UserPublic> {
    return this.getMe(targetId);
  }

  public async getMe(userId: string): Promise<UserPublic> {
    const existing = await this.users.findById(userId);
    if (!existing) throw new AppError(404, 'User not found');
    return toUserPublic(existing);
  }

  public async updateSelf(
    userId: string,
    body: UpdateUserPayload
  ): Promise<UserPublic> {
    return this.applyUpdate(userId, body);
  }

  public async updateAny(
    targetId: string,
    body: UpdateUserPayload
  ): Promise<UserPublic> {
    return this.applyUpdate(targetId, body);
  }

  public async deleteSelf(userId: string): Promise<void> {
    const existing = await this.users.findById(userId);
    if (!existing) throw new AppError(404, 'User not found');
    await this.users.deleteById(userId);
  }

  public async deleteAny(targetId: string): Promise<void> {
    const existing = await this.users.findById(targetId);
    if (!existing) throw new AppError(404, 'User not found');
    await this.users.deleteById(targetId);
  }

  private async applyUpdate(
    userId: string,
    body: UpdateUserPayload
  ): Promise<UserPublic> {
    assertValidCpf(body.cpf);
    assertStrongPassword(body.password);
    const existing = await this.users.findById(userId);
    if (!existing) throw new AppError(404, 'User not found');
    const nextCpf = normalizeCpf(body.cpf);
    await this.ensureCpfAvailableForUser(nextCpf, userId);
    const hash = await hashPassword(body.password);
    const row = await this.users.updateProfile(userId, {
      name: formatDisplayName(body.name),
      passwordHash: hash,
      cpf: nextCpf,
    });
    return toUserPublic(row);
  }

  private async ensureCpfAvailableForUser(
    cpf: string,
    userId: string
  ): Promise<void> {
    const other = await this.users.findByCpf(cpf);
    if (other && other.id !== userId) {
      throw new AppError(409, 'CPF already registered');
    }
  }
}
