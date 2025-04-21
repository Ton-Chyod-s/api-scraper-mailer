import { PrismaClient } from '.prisma/client';
import { UserRepository } from '../../usecases/user/create-user';
import { User } from '../../domain/entities/User';

const prisma = new PrismaClient();

export class PrismaUserRepository implements UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user) return null;

    return new User(user.name ?? '', user.email); 
  }

  async getAllEmails(): Promise<string[]> {
    const users = await prisma.user.findMany({
      select: { email: true }
    });
  
    return users.map((user: { email: string }) => user.email);
  }

  async save(user: User): Promise<void> {
    await prisma.user.create({
      data: {
        name: user.name,
        email: user.email
      }
    });
  }
}