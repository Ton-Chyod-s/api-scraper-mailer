"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaUserRepository = void 0;
const client_1 = require(".prisma/client");
const User_1 = require("../../../domain/entities/User");
const prisma = new client_1.PrismaClient();
class PrismaUserRepository {
    async findByEmail(email) {
        try {
            const user = await prisma.user.findUnique({
                where: { email }
            });
            if (!user)
                return null;
            return new User_1.User(user.name ?? '', user.email);
        }
        catch (error) {
            console.error("Error fetching user by email: ", error);
            throw new Error("Could not fetch user by email");
        }
    }
    async getAllEmails() {
        try {
            const users = await prisma.user.findMany({
                select: { email: true }
            });
            return users.map((user) => user.email);
        }
        catch (error) {
            console.error("Error fetching emails: ", error);
            throw new Error("Could not fetch emails");
        }
    }
    async save(user) {
        try {
            await prisma.user.create({
                data: {
                    name: user.name,
                    email: user.email
                }
            });
        }
        catch (error) {
            console.error("Error saving user: ", error);
            throw new Error("Could not save user");
        }
    }
    async disconnect() {
        await prisma.$disconnect();
    }
}
exports.PrismaUserRepository = PrismaUserRepository;
