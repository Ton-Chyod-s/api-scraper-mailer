export interface IMailProvider {
    sendMail(params: {
      to: string;
      subject: string;
      html: string;
    }): Promise<void>;
  }
  