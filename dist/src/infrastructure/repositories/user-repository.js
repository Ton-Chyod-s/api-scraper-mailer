"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaUserRepository = void 0;
const client_1 = require(".prisma/client");
const User_1 = require("../../domain/entities/User");
const prisma = new client_1.PrismaClient();
class PrismaUserRepository {
    findByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const user = yield prisma.user.findUnique({
                where: { email }
            });
            if (!user)
                return null;
            return new User_1.User((_a = user.name) !== null && _a !== void 0 ? _a : '', user.email);
        });
    }
    getAllEmails() {
        return __awaiter(this, void 0, void 0, function* () {
            const users = yield prisma.user.findMany({
                select: { email: true }
            });
            return users.map((user) => user.email);
        });
    }
    save(user) {
        return __awaiter(this, void 0, void 0, function* () {
            yield prisma.user.create({
                data: {
                    name: user.name,
                    email: user.email
                }
            });
        });
    }
}
exports.PrismaUserRepository = PrismaUserRepository;
