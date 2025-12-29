export type TaskLogProps = {
  id: string;
  taskName: string;
  executedAt: Date;
};

export class TaskLog {
  private constructor(private readonly props: Readonly<TaskLogProps>) {
    Object.freeze(this.props);
  }

  static create(
    input: Omit<TaskLogProps, 'id' | 'executedAt'> &
      Partial<Pick<TaskLogProps, 'id' | 'executedAt'>>,
  ) {
    const taskName = input.taskName?.trim();
    if (!taskName) throw new Error('taskName is required');

    return new TaskLog({
      id: input.id ?? crypto.randomUUID(),
      taskName,
      executedAt: input.executedAt ?? new Date(),
    });
  }

  get id() {
    return this.props.id;
  }
  get taskName() {
    return this.props.taskName;
  }
  get executedAt() {
    return this.props.executedAt;
  }
}
