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
const vitest_1 = require("vitest");
const send_email_use_case_1 = require("../../../../src/usecases/email/send-email-use-case");
const mail_provider_mock_1 = require("../providers/mail-provider.mock"); // Importando o mock
(0, vitest_1.describe)('SendEmailUseCase', () => {
    (0, vitest_1.it)('deve chamar sendMail com os parâmetros corretos', () => __awaiter(void 0, void 0, void 0, function* () {
        const sendEmailUseCase = new send_email_use_case_1.SendEmailUseCase(mail_provider_mock_1.mailProviderMock);
        const emailData = {
            to: 'email@example.com',
            subject: 'Assunto do E-mail',
            html: '<p>Conteúdo do e-mail</p>',
        };
        yield sendEmailUseCase.execute(emailData);
        (0, vitest_1.expect)(mail_provider_mock_1.mailProviderMock.sendMail).toHaveBeenCalledWith(emailData);
        (0, vitest_1.expect)(mail_provider_mock_1.mailProviderMock.sendMail).toHaveBeenCalledTimes(1);
    }));
});
