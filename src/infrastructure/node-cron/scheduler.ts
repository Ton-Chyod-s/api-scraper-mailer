import cron from 'node-cron';
import { myTask } from '../../usecases/my-task';    

cron.schedule('*/1 * * * *', () => {
  console.log('Running task every minute...');
  myTask();
});