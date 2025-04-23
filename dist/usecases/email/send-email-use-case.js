"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendEmailUseCase = void 0;
class SendEmailUseCase {
    constructor(mailProvider) {
        this.mailProvider = mailProvider;
    }
    async execute({ to, subject, html }) {
        await this.mailProvider.sendMail({
            to,
            subject,
            html,
        });
    }
}
exports.SendEmailUseCase = SendEmailUseCase;
