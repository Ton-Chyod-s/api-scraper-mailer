export type UserSourceProps = {
  userId: string;
  sourceId: string;
};

export class UserSource {
  private constructor(private readonly props: Readonly<UserSourceProps>) {
    Object.freeze(this.props);
  }

  static create(userId: string, sourceId: string) {
    if (!userId?.trim()) throw new Error('userId is required');
    if (!sourceId?.trim()) throw new Error('sourceId is required');

    return new UserSource({ userId, sourceId });
  }

  get userId() {
    return this.props.userId;
  }
  get sourceId() {
    return this.props.sourceId;
  }
}
