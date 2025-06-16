import { createUserDoc } from './user/create-user.doc';
import { militaryOttDoc } from './military/military-ott.doc';
import { officialJournalsStateDoc } from './official-journals/official-journals-state.doc';
import { officialJournalsMunicipalityDoc } from './official-journals/official-journals-municipality.doc';
import { authRegisterUserDoc } from './auth-user/auth-register-user.doc';
import { authLoginUserDoc } from './auth-user/auth-login-user.doc';

export const swaggerPaths = {
  ...createUserDoc,
  ...militaryOttDoc,
  ...officialJournalsStateDoc,
  ...officialJournalsMunicipalityDoc,
  ...authRegisterUserDoc,
  ...authLoginUserDoc
};