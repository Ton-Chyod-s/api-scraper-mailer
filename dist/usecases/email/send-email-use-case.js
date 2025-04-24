"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendEmailUseCase = void 0;
const nodemailer_provider_1 = require("../../infrastructure/providers/nodemailer-provider");
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
if (require.main === module) {
    const mailProvider = new nodemailer_provider_1.NodemailerProvider();
    const sendEmailUseCase = new SendEmailUseCase(mailProvider);
    sendEmailUseCase.execute({
        to: "hix_x@hotmail.com",
        subject: "Test Email",
        html: "<h1>Hello World</h1>"
    });
}
