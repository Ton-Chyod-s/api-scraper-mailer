import { usersDoc } from './user/create-user.doc';
import { militaryOttDoc } from './military/military-ott.doc';
import { officialJournalsStateDoc } from './official-journals/official-journals-state.doc';
import { officialJournalsMunicipalityDoc } from './official-journals/official-journals-municipality.doc';
import { authRegisterUserDoc } from './auth-user/auth-register-user.doc';
import { authLoginUserDoc } from './auth-user/auth-login-user.doc';
import { sourceDoc } from './user/source/source.doc';
import { militarySttDoc } from './military/military-stt.doc';

export const swaggerPaths = {
  ...usersDoc,
  ...militaryOttDoc,
  ...militarySttDoc,
  ...officialJournalsStateDoc,
  ...officialJournalsMunicipalityDoc,
  ...authRegisterUserDoc,
  ...authLoginUserDoc,
  ...sourceDoc
};