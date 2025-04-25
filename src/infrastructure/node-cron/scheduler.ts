import cron from 'node-cron';
import { myTask } from '../../main/jobs/my-task';    

// cron.schedule('0 8 * * 1-5', () => {
//   console.log('Executando tarefa a cada minuto...');
//   myTask();
// });

cron.schedule('* * * * *', () => {
  console.log('Executando tarefa a cada minuto...');
  myTask();
});