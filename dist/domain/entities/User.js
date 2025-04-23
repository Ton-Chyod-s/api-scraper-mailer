"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
class User {
    constructor(name, email) {
        this.name = name;
        this.email = email;
        if (!email.includes('@'))
            throw new Error('Email inválido');
    }
}
exports.User = User;
