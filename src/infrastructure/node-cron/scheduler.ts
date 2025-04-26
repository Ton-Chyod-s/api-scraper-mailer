import cron from 'node-cron';
import { myTask } from '../../main/jobs/my-task';    

cron.schedule('0 8 * * 1-7', () => {
  myTask();
}, {
  scheduled: true,
  timezone: 'America/Sao_Paulo'
});

