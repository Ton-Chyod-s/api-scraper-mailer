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
exports.CreateUser = void 0;
const User_1 = require("../../domain/entities/User");
class CreateUser {
    constructor(userRepo) {
        this.userRepo = userRepo;
    }
    execute(name, email) {
        return __awaiter(this, void 0, void 0, function* () {
            const existing = yield this.userRepo.findByEmail(email);
            if (existing)
                throw new Error('Usuário já existe');
            const user = new User_1.User(name, email);
            yield this.userRepo.save(user);
        });
    }
}
exports.CreateUser = CreateUser;
