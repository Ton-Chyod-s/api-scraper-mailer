import { PrismaUserRepository } from "../infrastructure/repositories/user-repository";
import { GetEmails } from "../usecases/user/get-emails";
import { GetUserNameByEmail } from "../usecases/user/get-user-name-by-email";
import { EnviarEmailsCompletos } from "../usecases/mailer/send-email-job-use-case";
import { enviarEmail } from "../interfaces/controllers/mail/send-email-controller";

export async function myTask(): Promise<void> {
  const userRepository = new PrismaUserRepository();

  const getEmails = new GetEmails(userRepository);
  const getUserNameByEmail = new GetUserNameByEmail(userRepository);

  const enviarEmailsCompletos = new EnviarEmailsCompletos(
    getEmails,
    getUserNameByEmail,
    enviarEmail
  );

  await enviarEmailsCompletos.execute();
}

if (require.main === module) {
  myTask().catch((error) => {
    console.error("Erro ao executar a tarefa:", error);
  });
}
