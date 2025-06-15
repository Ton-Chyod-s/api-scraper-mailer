import { usuariosDoc } from './user/usuarios.doc';
import { exercitoDoc } from './exercito/exercito.doc';
import { diarioOficialEstadoDoc } from './diario-oficial/diario-oficial-estado.doc';
import { diarioOficialMunicipioDoc } from './diario-oficial/diario-oficial-municipio.doc';
import { authUserDoc } from './auth-user/auth-user.doc';
import { authLoginDoc } from './auth-user/auth-login.doc';

export const swaggerPaths = {
  ...usuariosDoc,
  ...exercitoDoc,
  ...diarioOficialEstadoDoc,
  ...diarioOficialMunicipioDoc,
  ...authUserDoc,
  ...authLoginDoc
};