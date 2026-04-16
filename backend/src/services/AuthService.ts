import {
  formatDisplayName,
  type LoginPayload,
  type LoginResponse,
  type RegisterUserPayload,
  type UserPublic,
  type UserRole,
} from '@ecommerce/shared';
import { AppError } from '../errors/AppError';
import { toUserPublic } from '../mappers/userMapper';
import { UserModel } from '../models/UserModel';
import { assertValidCpf } from '../utils/cpf';
import { assertValidEmail } from '../utils/email';
import { assertStrongPassword } from '../utils/password';
import { comparePassword, hashPassword } from '../utils/cryptoPassword';
import { signUserToken } from '../utils/jwt';

const normalizeCpf = (raw: string): string => raw.replace(/\D/g, '');

export class AuthService {
  private readonly users = new UserModel();

  public async register(body: RegisterUserPayload): Promise<UserPublic> {
    this.validateRegistration(body);
    await this.ensureEmailFree(body.email.trim());
    await this.ensureCpfFree(normalizeCpf(body.cpf));
    const hash = await hashPassword(body.password);
    const row = await this.persistUser(body, hash);
    return toUserPublic(row);
  }

  public async changePassword(
    userId: string,
    passwords: { readonly current: string; readonly next: string }
  ): Promise<void> {
    const user = await this.users.findById(userId);
    if (!user) throw new AppError(404, 'User not found');
    const ok = await comparePassword(passwords.current, user.passwordHash);
    if (!ok) throw new AppError(401, 'Current password is incorrect');
    assertStrongPassword(passwords.next);
    const hash = await hashPassword(passwords.next);
    await this.users.updateProfile(userId, {
      name: user.name,
      passwordHash: hash,
      cpf: user.cpf,
    });
  }

  public async resetPasswordByEmail(
    email: string,
    newPassword: string
  ): Promise<void> {
    assertValidEmail(email);
    assertStrongPassword(newPassword);
    const user = await this.users.findByEmail(email.trim());
    if (!user) throw new AppError(404, 'Email not registered');
    const hash = await hashPassword(newPassword);
    await this.users.updateProfile(user.id, {
      name: user.name,
      passwordHash: hash,
      cpf: user.cpf,
    });
  }

  public async login(body: LoginPayload): Promise<LoginResponse> {
    assertValidEmail(body.email);
    const user = await this.users.findByEmail(body.email.trim());
    if (!user) throw new AppError(401, 'Not Registered');
    const ok = await comparePassword(body.password, user.passwordHash);
    if (!ok) throw new AppError(401, 'Invalid Password');
    const token = signUserToken(user.id, user.role as UserRole);
    return { token, user: toUserPublic(user) };
  }
  

  private validateRegistration(body: RegisterUserPayload): void {
    assertValidEmail(body.email);
    assertValidCpf(body.cpf);
    assertStrongPassword(body.password);
  }

  private async ensureEmailFree(email: string): Promise<void> {
    const exists = await this.users.findByEmail(email);
    if (exists) throw new AppError(409, 'Email already registered');
  }

  private async ensureCpfFree(cpf: string): Promise<void> {
    const exists = await this.users.findByCpf(cpf);
    if (exists) throw new AppError(409, 'CPF already registered');
  }

  private async persistUser(
    body: RegisterUserPayload,
    passwordHash: string
  ) {
    return this.users.create({
      name: formatDisplayName(body.name),
      email: body.email.trim(),
      passwordHash,
      cpf: normalizeCpf(body.cpf),
    });
  }
}
