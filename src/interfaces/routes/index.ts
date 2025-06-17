import { Router } from 'express';
import { HomeController } from '../controllers/home-controller';
import { sendEmailController } from '@interfaces/controllers/email/send-email-controller';
import { makeCreateUserController } from '@interfaces/factories/user/make-create-user-controller';
import { makeMilitaryOttController } from '@interfaces/factories/military/make-military-ott-controller';
import { makeOfficialJournalsStateController } from '@interfaces/factories/official-journals/make-official-journals-state-controller';
import { makeOfficialJournalsMunicipalityController } from '@interfaces/factories/official-journals/make-official-journals-municipality-controller';
import { makeRegisterCreateUserController } from '@interfaces/factories/auth-user/make-register-user-controller';
import { authenticateToken } from '@interfaces/middlewares/auth-middleware';
import { makeLoginController } from '@interfaces/factories/auth-user/make-login-user-controller';
import { makeFindAllUserController } from '@interfaces/factories/user/make-find-all-user-controller';


export const router = Router();

const userController = makeCreateUserController();
const exercitoController = makeMilitaryOttController();
const diarioEstadoController = makeOfficialJournalsStateController();
const diarioMunicipioController = makeOfficialJournalsMunicipalityController();
const authCreateUserController = makeRegisterCreateUserController(); 
const loginController = makeLoginController();
const findAllUserController = makeFindAllUserController();

// router.get('/', HomeController.welcome);

router.post('/users', authenticateToken, async (req, res) => {
  await userController.create(req, res)
});

router.get('/users', authenticateToken, async (req, res) => {
  await findAllUserController.findAll(req, res);
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
  await authCreateUserController.create(req, res);
});

router.post('/auth/login', async (req, res) => {
  await loginController.execute(req, res);
});
