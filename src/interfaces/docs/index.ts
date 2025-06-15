import { usuariosDoc } from './user/usuarios.doc';
import { exercitoDoc } from './exercito/exercito.doc';
import { diarioOficialEstadoDoc } from './diario-oficial/diario-oficial-estado.doc';
import { diarioOficialMunicipioDoc } from './diario-oficial/diario-oficial-municipio.doc';
import { authUserDoc } from './auth-user/auth-user.doc';

export const swaggerPaths = {
  ...usuariosDoc,
  ...exercitoDoc,
  ...diarioOficialEstadoDoc,
  ...diarioOficialMunicipioDoc,
  ...authUserDoc
};