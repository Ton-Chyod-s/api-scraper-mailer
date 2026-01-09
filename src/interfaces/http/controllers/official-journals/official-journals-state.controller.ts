import { FetchPublicationsInputDTO, SiteDataDTO } from '@domain/dtos/official-journals/search-official-journals.dto';
import { OfficialJournalsStateUseCase } from '@usecases/official-journals/official-journals-state.use-case';
import { z, ZodError } from 'zod';
import { errorMessages, httpStatusCodes } from '@utils/httpConstants';
import { AppError } from '@utils/app-error';
import { isBrDate, parseBrDateToUTC, parseIsoDateToUTC } from '@utils/date/date-time';

const YYYY_MM_DD = /^\d{4}-\d{2}-\d{2}$/;

function formatZodError(err: ZodError) {
  return err.issues.map((i) => `${i.path.join('.') || 'root'} - ${i.message}`).join('; ');
}

const dateField = (fieldName: string) =>
  z
    .string()
    .trim()
    .min(1, `${fieldName} is required`)
    .refine((s) => isBrDate(s) || YYYY_MM_DD.test(s), `${fieldName} must be DD/MM/YYYY or YYYY-MM-DD`)
    .transform((s) => {
      const v = s.trim();
      if (isBrDate(v)) return v;

      const d = parseIsoDateToUTC(v);
      const dd = String(d.getUTCDate()).padStart(2, '0');
      const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
      const yyyy = d.getUTCFullYear();
      return `${dd}/${mm}/${yyyy}`;
    });

const validationDTO: z.ZodType<FetchPublicationsInputDTO> = z
  .object({
    nome: z.string().trim().min(2).max(200).optional(),
    name: z.string().trim().min(2).max(200).optional(),

    dataInicio: dateField('dataInicio'),
    dataFim: dateField('dataFim'),

    retries: z.coerce.number().int().min(1).optional(),
    delayMs: z.coerce.number().int().min(1).max(1000).optional(),
  })
  .superRefine((val, ctx) => {
    const nomeFinal = (val.nome ?? val.name ?? '').trim();
    if (nomeFinal.length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['nome'],
        message: 'nome (or name) is required and must have at least 2 characters',
      });
      return;
    }

    const start = parseBrDateToUTC(val.dataInicio);
    const end = parseBrDateToUTC(val.dataFim);

    if (!start) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['dataInicio'],
        message: 'dataInicio is not a valid date',
      });
      return;
    }

    if (!end) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['dataFim'],
        message: 'dataFim is not a valid date',
      });
      return;
    }

    if (start.getTime() > end.getTime()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['dataFim'],
        message: 'dataFim must be greater than or equal to dataInicio',
      });
    }
  })
  .transform((val): FetchPublicationsInputDTO => ({
    nome: (val.nome ?? val.name ?? '').trim(),
    dataInicio: val.dataInicio,
    dataFim: val.dataFim,
    retries: val.retries,
    delayMs: val.delayMs,
  }));

export class OfficialJournalsStateController {
  constructor(private readonly useCase: OfficialJournalsStateUseCase) {}

  async handle(input: unknown) {
    const parsed = validationDTO.safeParse(input);
    if (!parsed.success) {
      throw AppError.badRequest(`Invalid request body: ${formatZodError(parsed.error)}`, 'BAD_REQUEST');
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
