"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.myTask = myTask;
const user_repository_1 = require("../../infrastructure/repositories/user-repository");
const get_emails_1 = require("../../usecases/user/get-emails");
const get_user_name_by_email_1 = require("../../usecases/user/get-user-name-by-email");
const send_email_job_use_case_1 = require("../../usecases/email/send-email-job-use-case");
const send_email_controller_1 = require("../../controllers/email/send-email-controller");
async function myTask() {
    const userRepository = new user_repository_1.PrismaUserRepository();
    const getEmails = new get_emails_1.GetEmails(userRepository);
    const getUserNameByEmail = new get_user_name_by_email_1.GetUserNameByEmail(userRepository);
    const enviarEmailsCompletos = new send_email_job_use_case_1.EnviarEmailsCompletos(getEmails, getUserNameByEmail, send_email_controller_1.enviarEmail);
    await enviarEmailsCompletos.execute();
}
if (require.main === module) {
    myTask().catch((error) => {
        console.error("Erro ao executar a tarefa:", error);
    });
}
