import { PrismaClient } from '@prisma/client';
import { User } from '@domain/entities/user';
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

      return new User(user.name ?? '', user.email, user.authUser.id, user.id);
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
    if (!user.authUserId) {
    throw new Error("authUserId is required to save user");
  }
    try {
      await prisma.user.create({
        data: {
          name: user.name,
          email: user.email,
          authUser: {
            connect: { id: Number(user.authUserId) } 
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

  async findAllUsers(authUserId: string): Promise<User[]> {
    
  try {
    const users = await prisma.user.findMany({
      where: {
        authUserId: Number(authUserId)
      }
    });

    const userList = users.map(user => new User(user.name ?? '', user.email, undefined, user.id));
    return userList;
  } catch (error) {
    console.error("Error fetching all users: ", error);
    throw new Error("Could not fetch users");
  }
}

}