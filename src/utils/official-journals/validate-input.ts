import { env } from '@config/env';
import { FetchPublicationsInputDTO } from '@domain/dtos/official-journals/search-official-journals.dto';
import { AppError } from '@utils/app-error';
import { isBrDate } from './is-br-date';
import { parseBrDateToUTC } from './parse-br-date';

const MAX_RANGE_DAYS = env.OFFICIAL_JOURNALS_MAX_RANGE_DAYS;

export function validateInput(input: FetchPublicationsInputDTO) {
  const nome = (input.nome ?? '').trim();
  if (nome.length < 3) {
    throw AppError.badRequest('Nome inválido', 'OFFICIAL_JOURNALS_INVALID_NAME', {
      nome: input.nome,
    });
  }

  if (!isBrDate(input.dataInicio)) {
    throw AppError.badRequest(
      'dataInicio inválida (DD/MM/AAAA)',
      'OFFICIAL_JOURNALS_INVALID_START_DATE',
      { dataInicio: input.dataInicio },
    );
  }

  if (!isBrDate(input.dataFim)) {
    throw AppError.badRequest(
      'dataFim inválida (DD/MM/AAAA)',
      'OFFICIAL_JOURNALS_INVALID_END_DATE',
      { dataFim: input.dataFim },
    );
  }

  const start = parseBrDateToUTC(input.dataInicio);
  const end = parseBrDateToUTC(input.dataFim);

  if (!start || !end) {
    throw AppError.badRequest('Datas inválidas', 'OFFICIAL_JOURNALS_INVALID_DATES', {
      dataInicio: input.dataInicio,
      dataFim: input.dataFim,
    });
  }

  if (start.getTime() > end.getTime()) {
    throw AppError.badRequest(
      'dataInicio não pode ser maior que dataFim',
      'OFFICIAL_JOURNALS_DATE_RANGE_INVALID',
      { dataInicio: input.dataInicio, dataFim: input.dataFim },
    );
  }

  const rangeDays = Math.floor((end.getTime() - start.getTime()) / 86_400_000) + 1;
  if (rangeDays > MAX_RANGE_DAYS) {
    throw AppError.badRequest(
      `Intervalo de datas muito grande (máx ${MAX_RANGE_DAYS} dias)`,
      'OFFICIAL_JOURNALS_DATE_RANGE_TOO_LARGE',
      {
        dataInicio: input.dataInicio,
        dataFim: input.dataFim,
        rangeDays,
        maxRangeDays: MAX_RANGE_DAYS,
      },
    );
  }
}
