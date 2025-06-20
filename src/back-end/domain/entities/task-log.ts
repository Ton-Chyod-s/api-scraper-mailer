
export class TaskLog {
    constructor(
        public task_name: string,
    ) {
        if (!task_name) throw new Error('nome da task inválido');
    }
}
