import { Request, Response } from "express";
import { SendEmailUseCase } from "../../useCases/SendEmailUseCase";
import { NodemailerProvider } from "../../infrastructure/providers/NodemailerProvider";

export class HomeController {
    static async welcome ( req: Request, res: Response ) {
        const mailProvider = new NodemailerProvider();
        const sendMail = new SendEmailUseCase(mailProvider);

        await sendMail.execute({
            to: 'hix_x@hotmail.com',
            subject: 'Test Email',
            html: '<h1>Hello World</h1>'
        }).then(() => {
            res.status(200).json({ message: "Email sent successfully!" });
        });
    }
}