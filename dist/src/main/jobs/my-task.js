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
exports.myTask = myTask;
const user_repository_1 = require("../../infrastructure/repositories/user-repository");
const get_emails_1 = require("../../usecases/user/get-emails");
const get_user_name_by_email_1 = require("../../usecases/user/get-user-name-by-email");
const send_email_job_use_case_1 = require("../../usecases/email/send-email-job-use-case");
const send_email_controller_1 = require("../../controllers/email/send-email-controller");
function myTask() {
    return __awaiter(this, void 0, void 0, function* () {
        const userRepository = new user_repository_1.PrismaUserRepository();
        const getEmails = new get_emails_1.GetEmails(userRepository);
        const getUserNameByEmail = new get_user_name_by_email_1.GetUserNameByEmail(userRepository);
        const enviarEmailsCompletos = new send_email_job_use_case_1.EnviarEmailsCompletos(getEmails, getUserNameByEmail, send_email_controller_1.enviarEmail);
        yield enviarEmailsCompletos.execute();
    });
}
if (require.main === module) {
    myTask().catch((error) => {
        console.error("Erro ao executar a tarefa:", error);
    });
}
