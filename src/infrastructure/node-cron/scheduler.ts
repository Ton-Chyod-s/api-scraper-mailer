import cron from 'node-cron';
import { myTask } from '../../jobs/my-task';    

cron.schedule('*/1 * * * *', () => {
  console.log('Executando tarefa a cada minuto...');
  myTask();
});