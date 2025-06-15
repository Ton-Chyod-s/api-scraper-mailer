import { usuariosDoc } from './user/usuarios.doc.ts';
import { exercitoDoc } from './exercito/exercito.doc.ts';
import { diarioOficialEstadoDoc } from './diario-oficial/diario-oficial-estado.doc.ts';
import { diarioOficialMunicipioDoc } from './diario-oficial/diario-oficial-municipio.doc.ts';
import { authUserDoc } from './auth-user/auth-user.doc.ts';

export const swaggerPaths = {
  ...usuariosDoc,
  ...exercitoDoc,
  ...diarioOficialEstadoDoc,
  ...diarioOficialMunicipioDoc,
  ...authUserDoc
};