import cron from 'node-cron';
import { myTask } from '../../main/jobs/my-task';    

cron.schedule('*/1 * * * *', () => {
  console.log('Executando tarefa a cada minuto...');
  myTask();
});