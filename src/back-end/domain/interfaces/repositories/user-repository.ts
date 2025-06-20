import { User } from '@domain/entities/user';

export interface UserRepository {
    findByEmail(email: string): Promise<User | null>;
    getAllEmails(): Promise<string[]>;
    save(user: User): Promise<void>;
    findAllUsers(authUserId: string): Promise<User[]>;
}