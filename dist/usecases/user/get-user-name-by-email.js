"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetUserNameByEmail = void 0;
class GetUserNameByEmail {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async execute(email) {
        const user = await this.userRepository.findByEmail(email);
        return user ? user.name : null;
    }
}
exports.GetUserNameByEmail = GetUserNameByEmail;
