import cron from 'node-cron';
import { myTask } from '../../main/jobs/my-task';    
import { CreateTaskLogUseCase } from '../../usecases/task-log/create-use-case';
import { PrismaTaskLogRepository } from '../repositories/task-log/task-log-repository';
import { parseExecutedAt } from '../utils/date/date-helper';

const taskLogRepository = new PrismaTaskLogRepository();
const createTaskLogUseCase = new CreateTaskLogUseCase(taskLogRepository);

async function executeTask() {
  const now = new Date();
  const taskNames = await taskLogRepository.getAllTaskNames();
  
  const lastTaskLogEntry = taskNames.at(-1);

  if (!lastTaskLogEntry) {
    throw new Error('No task logs available.');
  }

  const [taskName, executedAtString] = lastTaskLogEntry.split(' - ');
  
  const campoGrandeDate = parseExecutedAt(executedAtString);

  if (taskNames.includes('my-task') && campoGrandeDate.getTime() === now.getTime()) {
    console.log('Tarefa já executada hoje, no mesmo horário!');
    console.log('Data da tarefa (Campo Grande):', campoGrandeDate.toISOString());  
    return;
  }

  try {
    console.log('Executando tarefa agendada...');
    await createTaskLogUseCase.execute('my-task');
    myTask();
  } catch (error) {
    console.error('Erro ao executar tarefa:', error);
  }
}

cron.schedule('0 8 * * 1-7', async () => {
  console.log('Tarefa executada no horário!');
  await executeTask();
}, {
  scheduled: true,
  timezone: 'America/Campo_Grande'
});

const now = new Date();
const scheduledTime = new Date();
scheduledTime.setHours(8, 0, 0, 0);

if (now > scheduledTime) {
  console.log('Executando tarefa perdida...');
  executeTask();
}

if (require.main === module) {
  console.log('Scheduler is running...');
  executeTask();
}