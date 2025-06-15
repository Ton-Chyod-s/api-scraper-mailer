import { Router } from 'express';
import { HomeController } from '../controllers/home-controller';
import { enviarEmail } from '@interfaces/controllers/email/send-email-controller';
import { makeUserController } from '@interfaces/factories/user/make-user-controller';
import { makeExercitoController } from '@interfaces/factories/exercito/make-exercito-controller';
import { makeDiarioOficialEstadoController } from '@interfaces/factories/diario-oficial/make-diario-oficial-estado-controller';
import { makeDiarioOficialMunicipioController } from '@interfaces/factories/diario-oficial/make-diario-oficial-municipio-controller';
import { makeAuthUserController } from '@interfaces/factories/auth-user/make-auth-user-controller';

export const router = Router();

const userController = makeUserController();
const exercitoController = makeExercitoController();
const diarioEstadoController = makeDiarioOficialEstadoController();
const diarioMunicipioController = makeDiarioOficialMunicipioController();
const authUserController = makeAuthUserController(); 

// router.get('/', HomeController.welcome);

router.post('/pessoas', (req, res) => userController.create(req, res));

router.post('/mail', async (req, res) => {
  try {
    const { email, html, ano } = req.body; 
    await enviarEmail(email, html, ano);  
    res.status(200).send('E-mails enviados com sucesso!');
  } catch (error) {
    res.status(500).send('Erro ao enviar e-mails');
  }
});


router.get('/exercito', (req, res) => exercitoController.consultar(req, res));

router.post('/diarios/estado', (req, res) => diarioEstadoController.consultar(req, res)); 

router.post('/diarios/municipio', (req, res) => diarioMunicipioController.consultar(req, res));

router.post('/auth/user', (req, res) => authUserController.create(req, res));

