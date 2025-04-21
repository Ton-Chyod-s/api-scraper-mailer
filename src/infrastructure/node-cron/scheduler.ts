import cron from 'node-cron';
import { myTask } from '../../jobs/my-task';    
import { GetEmails } from '../../usecases/user/get-emails';
import { GetUserNameByEmail } from '../../usecases/user/get-user-name-by-email';
import { PrismaUserRepository } from '../repositories/user-repository';

cron.schedule('*/1 * * * *', () => {
  console.log('Executando tarefa a cada minuto...');
  const userRepository = new PrismaUserRepository();
  
  const getEmails = new GetEmails(userRepository);
  const getUserNameByEmail = new GetUserNameByEmail(userRepository);
  myTask(getEmails, getUserNameByEmail);
});