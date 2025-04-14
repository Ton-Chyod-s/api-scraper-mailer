import { NodemailerProvider } from "../infrastructure/providers/nodemailer-provider";
import { SendEmailUseCase } from "./send-email-use-case";

export async function myTask() {
    const mailProvider = new NodemailerProvider();
    const sendMail = new SendEmailUseCase(mailProvider);

    await sendMail.execute({
        to: 'hix_x@hotmail.com',
        subject: 'Test Email',
        html: '<h1>Hello World</h1>'
    }).then(() => {
        console.log("Email sent successfully!");
    });
}