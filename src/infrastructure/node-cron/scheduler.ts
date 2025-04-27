import cron from 'node-cron';
import { myTask } from '../../main/jobs/my-task';    
import { CreateTaskLogUseCase } from '../../usecases/task-log/create-use-case';
import { PrismaTaskLogRepository } from '../repositories/task-log/task-log-repository';

const taskLogRepository = new PrismaTaskLogRepository();
const createTaskLogUseCase = new CreateTaskLogUseCase(taskLogRepository);

function scheduleTask() {
  const now = new Date();
  const scheduledTime = new Date();
  scheduledTime.setHours(8, 0, 0, 0);

  taskLogRepository.getAllTaskNames().then((taskNames) => { 
    if (taskNames.includes('my-task') && now.getDate() === scheduledTime.getDate()) { 
      console.log('Tarefa já executada hoje!');
      return;
    }

    if (now > scheduledTime) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    const timeUntilNextExecution = scheduledTime.getTime() - now.getTime();
    setTimeout(() => {
      console.log('Executando tarefa agendada...');
      createTaskLogUseCase.execute('my-task');
      myTask();
    }, timeUntilNextExecution);
  });


  if ( now > scheduledTime ) {
    console.log('Executando tarefa perdida...');
    myTask();
  }
}

cron.schedule('0 8 * * 1-7', () => {
  console.log('Tarefa executada no horário!');
  createTaskLogUseCase.execute('my-task');
  myTask();
}, {
  scheduled: true,
  timezone: 'America/Campo_Grande'
});

scheduleTask();