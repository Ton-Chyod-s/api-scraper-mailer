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
import { makeGetSourcesByUserIdController } from '@interfaces/factories/user/source/make-get-source-by-user-id-controller';
import { makeMilitarySttController } from '@interfaces/factories/military/make-military-Stt-controller';
import { makeGetAllSourcesController } from '@interfaces/factories/user/source/make-get-all-source-controller';
import { makeAddSourceToUserController } from '@interfaces/factories/user/source/make-add-source-to-user-controller';


export const router = Router();

const userController = makeCreateUserController();
const exercitoOttController = makeMilitaryOttController();
const exercitoSttController = makeMilitarySttController();
const diarioEstadoController = makeOfficialJournalsStateController();
const diarioMunicipioController = makeOfficialJournalsMunicipalityController();
const authCreateUserController = makeRegisterCreateUserController(); 
const loginController = makeLoginController();
const findAllUserController = makeFindAllUserController();
const getSourcesByUserIdController = makeGetSourcesByUserIdController();
const getAllSourcesController = makeGetAllSourcesController();
const addSourceToUserController = makeAddSourceToUserController();

// router.get('/', HomeController.welcome);

router.post('/users', authenticateToken, async (req, res) => {
  await userController.create(req, res)
});

router.get('/users', authenticateToken, async (req, res) => {
  await findAllUserController.findAll(req, res);
});

router.get('/users/sources', authenticateToken, async (req, res) => {  
  await getSourcesByUserIdController.execute(req, res);
});

router.get('/sources', authenticateToken, async (req, res) => {
  await getAllSourcesController.execute(req, res);
});

router.post('/users/sourcess', authenticateToken, async (req, res) => {
  await addSourceToUserController.execute(req, res);
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


router.get('/military/ott', (req, res) => exercitoOttController.consultar(req, res));

router.get('/military/stt', (req, res) => exercitoSttController.consultar(req, res));

router.post('/official-journals/state', (req, res) => diarioEstadoController.consultar(req, res)); 

router.post('/official-journals/municipality', (req, res) => diarioMunicipioController.consultar(req, res));

router.post('/auth/register', async (req, res) => {
  await authCreateUserController.create(req, res);
});

router.post('/auth/login', async (req, res) => {
  await loginController.execute(req, res);
});

