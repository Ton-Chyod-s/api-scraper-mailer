import { FetchPublicationsInputDTO } from '@domain/dtos/official-journals/search-official-journals.dto';
import { OfficialJournalsStateUseCase } from '@usecases/official-journals/official-journals-state.use-case';
import { z, ZodError } from 'zod';
import { errorMessages, httpStatusCodes } from '@utils/httpConstants';

const YYYY_MM_DD = /^\d{4}-\d{2}-\d{2}$/;

const validationDTO = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, 'name must have at least 2 characters')
      .max(200, 'name is too long'),
    dataInicio: z
      .string()
      .trim()
      .regex(YYYY_MM_DD, 'dataInicio must be in YYYY-MM-DD format')
      .optional(),
    dataFim: z.string().trim().regex(YYYY_MM_DD, 'dataFim must be in YYYY-MM-DD format').optional(),
    retries: z.coerce.number().int().min(1).default(3),
    delayMs: z.coerce.number().int().min(1).max(100).default(25),
  })
  .superRefine((val, ctx) => {
    if (val.dataInicio && val.dataFim && val.dataInicio > val.dataFim) {
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

class HttpError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

export class OfficialJournalsStateController {
  constructor(private readonly useCase: OfficialJournalsStateUseCase) {}

  async handle(input: FetchPublicationsInputDTO) {
    let validated: z.infer<typeof validationDTO>;

    try {
      validated = validationDTO.parse(input);
    } catch (e) {
      if (e instanceof ZodError) {
        throw new HttpError(
          httpStatusCodes.BAD_REQUEST,
          `Invalid request body: ${formatZodError(e)}`,
        );
      }
      throw new HttpError(
        httpStatusCodes.INTERNAL_SERVER_ERROR,
        errorMessages.GENERAL.UNEXPECTED_ERROR,
        e,
      );
    }

    try {
      const result = await this.useCase.execute(validated as unknown as FetchPublicationsInputDTO);

      const isEmptyArray = Array.isArray(result) && result.length === 0;
      if (!result || isEmptyArray) {
        throw new HttpError(httpStatusCodes.NOT_FOUND, errorMessages.AUTH.USER_NOT_FOUND);
      }

      return {
        statusCode: httpStatusCodes.OK,
        message: errorMessages.GENERAL.SUCCESS,
        data: result,
      };
    } catch (e) {
      if (e instanceof HttpError) throw e;

      throw new HttpError(
        httpStatusCodes.INTERNAL_SERVER_ERROR,
        errorMessages.GENERAL.SERVER_ERROR,
        e,
      );
    }
  }
}
