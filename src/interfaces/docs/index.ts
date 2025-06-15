import { usuariosDoc } from './user/create-user.doc';
import { exercitoDoc } from './military/military-ott.doc';
import { diarioOficialEstadoDoc } from './official-journals/official-journals-state.doc';
import { diarioOficialMunicipioDoc } from './official-journals/official-journals-municipality.doc';
import { authUserDoc } from './auth-user/auth-register-user.doc';
import { authLoginDoc } from './auth-user/auth-login-user.doc';

export const swaggerPaths = {
  ...usuariosDoc,
  ...exercitoDoc,
  ...diarioOficialEstadoDoc,
  ...diarioOficialMunicipioDoc,
  ...authUserDoc,
  ...authLoginDoc
};