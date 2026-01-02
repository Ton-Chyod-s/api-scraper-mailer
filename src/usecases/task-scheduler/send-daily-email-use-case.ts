import { IMailerService } from '@domain/services/mailer-service';

export class SendDailyEmailUseCase {
  constructor(private readonly mailer: IMailerService) {}

  async execute(): Promise<void> {
    await this.mailer.sendMail({
      to: 'klayton.dias@hotmail.com',
      subject: 'Minha tarefa diária',
      html: '<p>Rodou às 08:00 MS.</p>',
    });
  }
}
