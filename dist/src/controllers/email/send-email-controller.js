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
exports.enviarEmail = enviarEmail;
const send_email_use_case_1 = require("../../usecases/email/send-email-use-case");
const nodemailer_provider_1 = require("../../infrastructure/providers/nodemailer-provider");
function enviarEmail(email, html, ano) {
    return __awaiter(this, void 0, void 0, function* () {
        const mailProvider = new nodemailer_provider_1.NodemailerProvider();
        const sendMail = new send_email_use_case_1.SendEmailUseCase(mailProvider);
        if (!email || !isValidEmail(email)) {
            throw new Error("Nenhum destinatário válido fornecido.");
        }
        yield sendMail.execute({
            to: email,
            subject: `Atualizações - ${ano}`,
            html: html,
        });
    });
}
function isValidEmail(email) {
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return regex.test(email);
}
