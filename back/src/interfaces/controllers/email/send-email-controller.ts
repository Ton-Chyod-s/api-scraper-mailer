import { SendEmailUseCase } from "@usecases/email/send-email-use-case";
import { NodemailerProvider } from "@infra/providers/nodemailer-provider";

export async function sendEmailController(email: string, html: string, ano: string): Promise<void> {
  const mailProvider = new NodemailerProvider();
  const sendMail = new SendEmailUseCase(mailProvider);

  if (!email || !isValidEmail(email)) {
    throw new Error("Nenhum destinatário válido fornecido.");
  }

  await sendMail.execute({
    to: email,
    subject: `Atualizações - ${ano}`,
    html: html,
  });
}

function isValidEmail(email: string): boolean {
  const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
  return regex.test(email);
}
