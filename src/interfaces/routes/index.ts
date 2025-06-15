import { Router } from 'express';
import { HomeController } from '../controllers/home-controller';
import { sendEmailController } from '@interfaces/controllers/email/send-email-controller';
import { makeUserController } from '@interfaces/factories/user/make-create-user-controller';
import { makeMilitaryOttController } from '@interfaces/factories/military/make-military-ott-controller';
import { makeDiarioOficialEstadoController } from '@interfaces/factories/official-journals/make-official-journals-state-controller';
import { makeDiarioOficialMunicipioController } from '@interfaces/factories/official-journals/make-official-journals-municipality-controller';
import { makeRegisterUserController } from '@interfaces/factories/auth-user/make-register-user-controller';
import { authenticateToken } from '@interfaces/middlewares/auth-middleware';
import { makeLoginController } from '@interfaces/factories/auth-user/make-login-user-controller';


export const router = Router();

const userController = makeUserController();
const exercitoController = makeMilitaryOttController();
const diarioEstadoController = makeDiarioOficialEstadoController();
const diarioMunicipioController = makeDiarioOficialMunicipioController();
const authUserController = makeRegisterUserController(); 
const loginController = makeLoginController();

// router.get('/', HomeController.welcome);

router.post('/users', authenticateToken, async (req, res) => {
  await userController.create(req, res)
});

router.post('/mail', async (req, res) => {
  try {
    const { email, html, ano } = req.body; 
    await sendEmailController(email, html, ano);  
    res.status(200).send('E-mails enviados com sucesso!');
  } catch (error) {
    res.status(500).send('Erro ao enviar e-mails');
  }
});


router.get('/military/ott', (req, res) => exercitoController.consultar(req, res));

router.post('/official-journals/state', (req, res) => diarioEstadoController.consultar(req, res)); 

router.post('/official-journals/municipality', (req, res) => diarioMunicipioController.consultar(req, res));

router.post('/auth/register', async (req, res) => {
  await authUserController.create(req, res);
});

router.post('/auth/login', async (req, res) => {
  await loginController.execute(req, res);
});
