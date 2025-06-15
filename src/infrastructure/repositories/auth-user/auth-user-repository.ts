import { PrismaClient } from '@prisma/client';
import { AuthUser } from '@domain/entities/auth-user';
import { AuthUserRepository } from '@domain/interfaces/repositories/auth-user-repository';

const prisma = new PrismaClient();

export class PrismaAuthUserRepository implements AuthUserRepository {
    async createUser(user: AuthUser): Promise<void> {
        try {
            await prisma.authUser.create({
                data: {
                    name: user.name,
                    email: user.email,
                    password: user.password,
                    role: user.role
                }
            });
        } catch (error) {
            throw new Error("Could not create user");
        }
    }
}
