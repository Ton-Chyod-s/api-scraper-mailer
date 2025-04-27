import cron from 'node-cron';
import { myTask } from '../../main/jobs/my-task';    

function scheduleTask() {
  const now = new Date();
  const scheduledTime = new Date();
  scheduledTime.setHours(8, 0, 0, 0);

  if ( now > scheduledTime ) {
    console.log('Executando tarefa perdida...');
    myTask();
  }
}

cron.schedule('0 8 * * 1-7', () => {
  console.log('Tarefa executada no horário!');
  myTask();
}, {
  scheduled: true,
  timezone: 'America/Campo_Grande'
});

scheduleTask();