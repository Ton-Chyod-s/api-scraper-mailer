const nodemailer = require("nodemailer");
import { IMailProvider } from "../../domain/providers/mail/mail-provider";

require('dotenv').config({ path: '.env' });

export class NodemailerProvider implements IMailProvider {
    private transporter;
  
    constructor() {
      this.transporter = nodemailer.createTransport({
        host: process.env.HOST,
        port: process.env.PORT,
        secure: false,
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
