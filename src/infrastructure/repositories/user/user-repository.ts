import { PrismaClient } from '@prisma/client';
import { User } from '@domain/entities/User';
import { UserRepository } from '@domain/interfaces/repositories/user-repository';

const prisma = new PrismaClient();

export class PrismaUserRepository implements UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          authUser: true,
        }
      });

      if (!user) return null;

      return new User(user.name ?? '', user.email, user.authUser.id);
    } catch (error) {
      console.error("Error fetching user by email: ", error);
      return null;
    }
  }

  async getAllEmails(): Promise<string[]> {
    try {
      const users = await prisma.user.findMany({
        select: { email: true }
      });
    
      return users.map((user: { email: string }) => user.email);
    } catch (error) {
      console.error("Error fetching emails: ", error);
      throw new Error("Could not fetch emails");
    }
  }

  async save(user: User): Promise<void> {
    try {
      await prisma.user.create({
        data: {
          name: user.name,
          email: user.email,
          authUser: {
            connect: { id: user.authUserId } 
          }
        }
      });
    } catch (error) {
      console.error("Error saving user: ", error);
      throw new Error("Could not save user");
    }
  }

  async disconnect(): Promise<void> {
    await prisma.$disconnect();
  }

}