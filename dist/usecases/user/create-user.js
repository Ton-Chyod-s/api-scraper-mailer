"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateUser = void 0;
const User_1 = require("../../domain/entities/User");
class CreateUser {
    constructor(userRepo) {
        this.userRepo = userRepo;
    }
    async execute(name, email) {
        const existing = await this.userRepo.findByEmail(email);
        if (existing)
            throw new Error('Usuário já existe');
        const user = new User_1.User(name, email);
        await this.userRepo.save(user);
    }
}
exports.CreateUser = CreateUser;
