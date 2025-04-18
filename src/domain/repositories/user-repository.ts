import { User } from '../entities/User';

export interface UserRepository {
    findByEmail(email: string): Promise<User | null>;
    getAllEmails(): Promise<string[]>;
    save(user: User): Promise<void>;
}