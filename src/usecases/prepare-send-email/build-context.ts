import { IUserRepository } from '@domain/repositories/user-repository';
import { parseBrDateToUTC } from '@utils/date/date-time';
import {
  BuildContextResult,
  UserListItem,
} from '@domain/dtos/prepare-send-email/prepare-send-email';

export async function buildContext(userRepository: IUserRepository): Promise<BuildContextResult> {
  const users = (await userRepository.findAll()) as UserListItem[];
  if (users.length === 0) {
    const reason = 'No users found to send email.';
    console.log(reason);
    return { ok: false, reason, users: [], diaAlvoStr: '', anoVigente: '' };
  }

  const diaAlvoStr = new Date().toLocaleDateString('pt-BR', {
    timeZone: 'America/Campo_Grande',
  });

  const diaAlvoDate = parseBrDateToUTC(diaAlvoStr);
  if (!diaAlvoDate) {
    const reason = 'Invalid target day.';
    console.log(reason, diaAlvoStr);
    return { ok: false, reason, users, diaAlvoStr, anoVigente: '' };
  }

  const anoVigente = diaAlvoStr.split('/')[2] ?? '';
  if (!anoVigente) {
    const reason = 'Invalid year extracted from target day.';
    console.log(reason, diaAlvoStr);
    return { ok: false, reason, users, diaAlvoStr, anoVigente: '' };
  }

  const yearStartStr = `01/01/${anoVigente}`;
  const yearEndStr = `31/12/${anoVigente}`;

  const inicioAnoDate = parseBrDateToUTC(yearStartStr);
  const fimAnoDate = parseBrDateToUTC(yearEndStr);

  if (!inicioAnoDate || !fimAnoDate) {
    const reason = 'Invalid year date range.';
    console.log(reason, { yearStartStr, yearEndStr });
    return { ok: false, reason, users, diaAlvoStr, anoVigente };
  }

  return {
    ok: true,
    users,
    diaAlvoStr,
    diaAlvoDate,
    anoVigente,
    inicioAnoDate,
    fimAnoDate,
  };
}
