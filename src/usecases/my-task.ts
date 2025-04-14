import { NodemailerProvider } from "../infrastructure/providers/nodemailer-provider";
import { SendEmailUseCase } from "./send-email-use-case";
import { readFile } from 'fs/promises';

export async function myTask() {
    const ano = new Date().getFullYear().toString();

    let htmlBase = await readFile("./src/static/main.html", "utf-8");
    let header = await readFile("./src/static/emails/header.html", "utf-8");   

    const conteudo = header;
    const htmlFinal = htmlBase.replace("<main></main>", `<main>${conteudo}</main>`);

    const mailProvider = new NodemailerProvider();
    const sendMail = new SendEmailUseCase(mailProvider);
 
    await sendMail.execute({
        to: 'hix_x@hotmail.com',
        subject: `Atualizações - UFMS, OTT, DOE, DIOGrande MS ${ano}`,
        html: htmlFinal,
    }).then(() => {
        console.log("Email sent successfully!");
    });
}   
