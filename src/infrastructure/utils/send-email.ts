import { SendEmailUseCase } from "../../usecases/send-email-use-case";
import { NodemailerProvider } from "../providers/nodemailer-provider";
import { PrismaUserRepository } from "../repositories/user-repository";

export async function enviarEmail(html: string, ano: string): Promise<void> {
  const mailProvider = new NodemailerProvider();
  const sendMail = new SendEmailUseCase(mailProvider);
  const emails = await listarTodosEmails();

  for (const email of emails) {
    await sendMail.execute({
      to: email,
      subject: `Atualizações - ${ano}`,
      html: html,
    });
  }
}

async function listarTodosEmails(): Promise<string[]> {
    const userRepository = new PrismaUserRepository();
    const emails = await userRepository.getAllEmails();
    return emails;
}
