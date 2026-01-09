import { OfficialJournalsMunicipalityUseCase } from '@usecases/official-journals/official-journals-municipality.use-case';
import {
  FetchPublicationsInputDTO,
  SiteDataDTO,
} from '@domain/dtos/official-journals/search-official-journals.dto';
import { z, ZodError } from 'zod';
import { errorMessages, httpStatusCodes } from '@utils/httpConstants';
import { AppError } from '@utils/app-error';

const DD_MM_YYYY = /^\d{2}\/\d{2}\/\d{4}$/;

const dateField = (fieldName: string) =>
  z
    .string()
    .trim()
    .default('')
    .refine((s) => s === '' || DD_MM_YYYY.test(s), `${fieldName} must be in DD/MM/YYYY format`);

const validationDTO: z.ZodType<FetchPublicationsInputDTO> = z
  .object({
    nome: z
      .string()
      .trim()
      .min(2, 'nome must have at least 2 characters')
      .max(200, 'nome is too long'),
    dataInicio: dateField('dataInicio'),
    dataFim: dateField('dataFim'),
    retries: z.coerce.number().int().min(1).optional(),
    delayMs: z.coerce.number().int().min(1).max(100).optional(),
  })
  .superRefine((val, ctx) => {
    if (!val.dataInicio || !val.dataFim) return;

    const [d1, m1, y1] = val.dataInicio.split('/').map(Number);
    const [d2, m2, y2] = val.dataFim.split('/').map(Number);

    const a = new Date(y1, m1 - 1, d1).getTime();
    const b = new Date(y2, m2 - 1, d2).getTime();

    if (a > b) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['dataFim'],
        message: 'dataFim must be greater than or equal to dataInicio',
      });
    }
  });

function formatZodError(err: ZodError) {
  return err.issues.map((i) => `${i.path.join('.') || 'root'} - ${i.message}`).join('; ');
}

export class OfficialJournalsMunicipalityController {
  constructor(private readonly useCase: OfficialJournalsMunicipalityUseCase) {}

  async handle(input: FetchPublicationsInputDTO) {
    const parsed = validationDTO.safeParse(input);
    if (!parsed.success) {
      throw AppError.badRequest(
        `Invalid request body: ${formatZodError(parsed.error)}`,
        'BAD_REQUEST',
      );
    }

    try {
      const result: SiteDataDTO = await this.useCase.execute(parsed.data);

      if (result.conteudos.length === 0) {
        throw AppError.notFound(errorMessages.AUTH.USER_NOT_FOUND, 'NOT_FOUND');
      }

      return {
        statusCode: httpStatusCodes.OK,
        message: errorMessages.GENERAL.SUCCESS,
        data: result,
      };
    } catch (e) {
      if (e instanceof AppError) throw e;

      throw new AppError({
        statusCode: httpStatusCodes.INTERNAL_SERVER_ERROR,
        code: 'INTERNAL_SERVER_ERROR',
        message: errorMessages.GENERAL.SERVER_ERROR,
        cause: e,
      });
    }
  }
}
