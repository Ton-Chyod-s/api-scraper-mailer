import { Router } from 'express';
import { HomeController } from '../interfaces/controllers/home-controller';
import { UserController } from '../interfaces/controllers/user-controller';
import { CreateUser } from '../usecases/user/create-user';
import { PrismaUserRepository } from '../infrastructure/repositories/user-repository';
import { ExercitoWebScraper } from '../infrastructure/web/exercito-web-scraper';
import { ExercitoUseCase } from '../usecases/exércitoWork/exercito-use-case';
import { DiarioOficialWeb } from '../infrastructure/web/diario-oficial-web';
import { ConsultarDiarioOficialUseCase } from '../usecases/diárioOficial/consultar-diario-oficial-estado';
import { DiarioOficialController } from '../interfaces/controllers/diario-oficial-web-controller';
import { enviarEmail } from '../interfaces/controllers/send-email-controller';

export const router = Router();

router.get('/', HomeController.welcome);

const userRepository = new PrismaUserRepository();
const createUser = new CreateUser(userRepository);
const userController = new UserController(createUser);

router.post('/users', (req, res) => userController.create(req, res));

const scraper = new ExercitoWebScraper();
const exercitoUseCase = new ExercitoUseCase(scraper);

router.post('/mail', async (req, res) => {
  try {
    const { email, html, ano } = req.body; 
    await enviarEmail(email, html, ano);  
    res.status(200).send('E-mails enviados com sucesso!');
  } catch (error) {
    res.status(500).send('Erro ao enviar e-mails');
  }
});

router.get('/exercito', async (req, res) => {
  try {
    const content = await exercitoUseCase.execute();
    res.send(content);
  } catch (error) {
    res.status(500).send('Error fetching content from Exercito website');
  }
});

const diarioOficialProvider = new DiarioOficialWeb();
const consultarUseCase = new ConsultarDiarioOficialUseCase(diarioOficialProvider);
const diarioController = new DiarioOficialController(consultarUseCase);

router.post('/doe', (req, res) => diarioController.consultar(req, res)); 
