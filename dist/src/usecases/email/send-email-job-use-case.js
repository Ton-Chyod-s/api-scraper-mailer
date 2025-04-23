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
exports.EnviarEmailsCompletos = void 0;
const user_repository_1 = require("../../infrastructure/repositories/user-repository");
const date_helper_1 = require("../../infrastructure/utils/date/date-helper");
const email_helper_1 = require("../../infrastructure/utils/email/email-helper");
const get_emails_1 = require("../user/get-emails");
const get_user_name_by_email_1 = require("../user/get-user-name-by-email");
class EnviarEmailsCompletos {
    constructor(getEmails, getUserNameByEmail, enviarEmail) {
        this.getEmails = getEmails;
        this.getUserNameByEmail = getUserNameByEmail;
        this.enviarEmail = enviarEmail;
    }
    execute() {
        return __awaiter(this, void 0, void 0, function* () {
            const ano = new Date().getFullYear();
            const dataInit = (0, date_helper_1.formatarData)(new Date(ano, 0, 1));
            const dataFinish = (0, date_helper_1.formatarData)(new Date(ano, 11, 31));
            const [emails, htmlBase, header, doeTemplate, diograndeTemplate] = yield Promise.all([
                this.getEmails.execute(),
                (0, email_helper_1.carregarArquivo)('./src/static/main.html'),
                (0, email_helper_1.carregarArquivo)('./src/static/emails/header.html'),
                (0, email_helper_1.carregarArquivo)('./src/static/emails/doe.html'),
                (0, email_helper_1.carregarArquivo)('./src/static/emails/diogrande.html')
            ]);
            const exercitoTemplate = yield (0, email_helper_1.carregarTemplateExercito)(ano.toString());
            const listaFormatadaExercito = yield (0, email_helper_1.gerarListaFormatadaExercito)();
            const exercitoFinal = (0, email_helper_1.preencherTemplate)(exercitoTemplate, 'listaExercito', listaFormatadaExercito);
            for (const email of emails) {
                try {
                    const userName = yield this.getUserNameByEmail.execute(email);
                    if (!userName) {
                        console.warn(`Usuário não encontrado para o e-mail: ${email}`);
                        continue;
                    }
                    const corpoEmail = yield (0, email_helper_1.montarCorpoEmail)(userName, { doe: doeTemplate, diogrande: diograndeTemplate }, { inicio: dataInit, fim: dataFinish });
                    const corpoCompleto = exercitoFinal + corpoEmail;
                    const htmlFinal = (0, email_helper_1.montarHtmlFinal)(htmlBase, header, corpoCompleto);
                    yield this.enviarEmail(email, htmlFinal, ano.toString());
                    console.log(`E-mail enviado para: ${userName} email: ${email}`);
                }
                catch (error) {
                    console.error(`Falha ao enviar e-mail para ${email}:`, error);
                }
            }
        });
    }
}
exports.EnviarEmailsCompletos = EnviarEmailsCompletos;
if (require.main === module) {
    const userRepository = new user_repository_1.PrismaUserRepository();
    const getEmails = new get_emails_1.GetEmails(userRepository);
    const getUserNameByEmail = new get_user_name_by_email_1.GetUserNameByEmail(userRepository);
    const enviarEmail = (email, html, subject) => __awaiter(void 0, void 0, void 0, function* () { });
    const enviarEmailsCompletos = new EnviarEmailsCompletos(getEmails, getUserNameByEmail, enviarEmail);
    enviarEmailsCompletos.execute().catch((error) => {
        console.error("Erro ao executar a tarefa:", error);
    });
}
