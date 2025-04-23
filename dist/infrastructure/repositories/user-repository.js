"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaUserRepository = void 0;
const client_1 = require(".prisma/client");
const User_1 = require("../../domain/entities/User");
const prisma = new client_1.PrismaClient();
class PrismaUserRepository {
    async findByEmail(email) {
        const user = await prisma.user.findUnique({
            where: { email }
        });
        if (!user)
            return null;
        return new User_1.User(user.name ?? '', user.email);
    }
    async getAllEmails() {
        const users = await prisma.user.findMany({
            select: { email: true }
        });
        return users.map((user) => user.email);
    }
    async save(user) {
        await prisma.user.create({
            data: {
                name: user.name,
                email: user.email
            }
        });
    }
}
exports.PrismaUserRepository = PrismaUserRepository;
