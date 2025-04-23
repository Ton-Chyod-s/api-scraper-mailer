"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnviarEmailsCompletos = void 0;
const send_email_controller_1 = require("../../controllers/email/send-email-controller");
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
    async execute() {
        const ano = new Date().getFullYear();
        const dataInit = (0, date_helper_1.formatarData)(new Date(ano, 0, 1));
        const dataFinish = (0, date_helper_1.formatarData)(new Date(ano, 11, 31));
        const [emails, htmlBase, header, doeTemplate, diograndeTemplate] = await Promise.all([
            this.getEmails.execute(),
            (0, email_helper_1.carregarArquivo)('./src/templates/main.html'),
            (0, email_helper_1.carregarArquivo)('./src/templates/emails/header.html'),
            (0, email_helper_1.carregarArquivo)('./src/templates/emails/doe.html'),
            (0, email_helper_1.carregarArquivo)('./src/templates/emails/diogrande.html')
        ]);
        const exercitoTemplate = await (0, email_helper_1.carregarTemplateExercito)(ano.toString());
        const listaFormatadaExercito = await (0, email_helper_1.gerarListaFormatadaExercito)();
        const exercitoFinal = (0, email_helper_1.preencherTemplate)(exercitoTemplate, 'listaExercito', listaFormatadaExercito);
        for (const email of emails) {
            try {
                const userName = await this.getUserNameByEmail.execute(email);
                if (!userName) {
                    console.warn(`Usuário não encontrado para o e-mail: ${email}`);
                    continue;
                }
                const corpoEmail = await (0, email_helper_1.montarCorpoEmail)(userName, { doe: doeTemplate, diogrande: diograndeTemplate }, { inicio: dataInit, fim: dataFinish });
                const corpoCompleto = exercitoFinal + corpoEmail;
                const htmlFinal = (0, email_helper_1.montarHtmlFinal)(htmlBase, header, corpoCompleto);
                await this.enviarEmail(email, htmlFinal, ano.toString());
                console.log(`E-mail enviado para: ${userName} email: ${email}`);
            }
            catch (error) {
                console.error(`Falha ao enviar e-mail para ${email}:`, error);
            }
        }
    }
}
exports.EnviarEmailsCompletos = EnviarEmailsCompletos;
if (require.main === module) {
    const userRepo = new user_repository_1.PrismaUserRepository();
    const getEmails = new get_emails_1.GetEmails(userRepo);
    const getUserNameByEmail = new get_user_name_by_email_1.GetUserNameByEmail(userRepo);
    const enviarEmailsCompletos = new EnviarEmailsCompletos(getEmails, getUserNameByEmail, send_email_controller_1.enviarEmail);
    enviarEmailsCompletos.execute();
}
