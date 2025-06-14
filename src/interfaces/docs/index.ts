import { usuariosDoc } from './user/usuarios.doc.js';
import { exercitoDoc } from './exercito/exercito.doc.js';
import { diarioOficialEstadoDoc } from './diario-oficial/diario-oficial-estado.doc.js';
import { diarioOficialMunicipioDoc } from './diario-oficial/diario-oficial-municipio.doc.js';

export const swaggerPaths = {
  ...usuariosDoc,
  ...exercitoDoc,
  ...diarioOficialEstadoDoc,
  ...diarioOficialMunicipioDoc
};