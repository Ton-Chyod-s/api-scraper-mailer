"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetEmails = void 0;
class GetEmails {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async execute() {
        return await this.userRepository.getAllEmails();
    }
}
exports.GetEmails = GetEmails;
