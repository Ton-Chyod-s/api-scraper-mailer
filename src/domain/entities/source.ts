export type SourceProps = {
  id: string;
  name: string;
};

export class Source {
  private constructor(private readonly props: Readonly<SourceProps>) {
    Object.freeze(this.props);
  }

  static create(input: Omit<SourceProps, 'id'> & Partial<Pick<SourceProps, 'id'>>) {
    const name = input.name?.trim();
    if (!name) throw new Error('name is required');

    return new Source({
      id: input.id ?? crypto.randomUUID(),
      name,
    });
  }

  get id() {
    return this.props.id;
  }
  get name() {
    return this.props.name;
  }
}
