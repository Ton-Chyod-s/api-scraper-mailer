"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.enviarEmail = enviarEmail;
const send_email_use_case_1 = require("../../usecases/email/send-email-use-case");
const nodemailer_provider_1 = require("../../infrastructure/providers/nodemailer-provider");
async function enviarEmail(email, html, ano) {
    const mailProvider = new nodemailer_provider_1.NodemailerProvider();
    const sendMail = new send_email_use_case_1.SendEmailUseCase(mailProvider);
    if (!email || !isValidEmail(email)) {
        throw new Error("Nenhum destinatário válido fornecido.");
    }
    await sendMail.execute({
        to: email,
        subject: `Atualizações - ${ano}`,
        html: html,
    });
}
function isValidEmail(email) {
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return regex.test(email);
}
