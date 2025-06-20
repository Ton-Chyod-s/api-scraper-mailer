import { GetAllSourcesUseCase } from "@usecases/user/source/get-all-source";


export class GetAllSourcesController {
  constructor(
    private getAllSourcesUseCase: GetAllSourcesUseCase
  ) {}

  async execute(req: any, res: any): Promise<any> {
    try {
      const sources = await this.getAllSourcesUseCase.execute();
      return res.status(200).send(sources);
    } catch (err: any) {
      return res.status(400).send({ error: err.message });
    }
  }
}