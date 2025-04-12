const nodemailer = require("nodemailer");
import { IMailProvider } from "../../interfaces/providers/IMailProvider";

require('dotenv').config({ path: '.env' });

export class NodemailerProvider implements IMailProvider {
    private transporter;
  
    constructor() {
      this.transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
          user: process.env.USER,
          pass: process.env.PASSWORD,
        },
      });
    }
  
    async sendMail({ to, subject, html }: {
      to: string;
      subject: string;
      html: string;
    }): Promise<void> {
      await this.transporter.sendMail({
        from: process.env.USER,
        to,
        subject,
        html,
      });
    }
  }
