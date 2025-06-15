import { AuthUser } from "@domain/entities/auth-user";

export interface AuthUserRepository {
  createUser(user: AuthUser): Promise<void>;
  findByEmail(email: string): Promise<AuthUser | null>;
}