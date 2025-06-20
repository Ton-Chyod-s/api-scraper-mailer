import { PrismaClient } from '@prisma/client';
import { AuthUser } from '@domain/entities/auth-user';
import { AuthUserRepository } from '@domain/interfaces/repositories/auth-user-repository';


const prisma = new PrismaClient();

export class PrismaAuthUserRepository implements AuthUserRepository {
    async createUser(user: AuthUser): Promise<AuthUser> {
        try {
            const createdUser = await prisma.authUser.create({
                data: {
                    name: user.name,
                    email: user.email,
                    password: user.password,
                    role: user.role
                }
            });

            return createdUser;
        } catch (error) {
            throw new Error("Could not create user");
        }
    }

    async findByEmail(email: string): Promise<AuthUser | null> {
        try {
            const user = await prisma.authUser.findUnique({
                where: { email }
            });
            return user ? new AuthUser(user.name, user.email, user.password, user.role, user.id) : null;
        } catch (error) {
            throw new Error("Could not find user by email");
        }
    }
}
