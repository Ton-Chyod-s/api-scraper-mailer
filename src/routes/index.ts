import { Router } from 'express';
import { HomeController } from '../interfaces/controllers/home-controller';
import { UserController } from '../interfaces/controllers/user-controller';
import { CreateUser } from '../usecases/user/create-user';
import { PrismaUserRepository } from '../infrastructure/repositories/user-repository';
import { ExercitoWebScraper } from '../infrastructure/providers/gateways/exercito-work/exercito-web-scraper';
import { ExercitoUseCase } from '../usecases/exercito-work/exercito-use-case';
import { DiarioOficialEstadoWeb } from '../infrastructure/providers/gateways/diario-oficial/diario-oficial-estado-web';
import { ConsultarDiarioOficialEstadoUseCase } from '../usecases/diario-oficial/consultar-diario-oficial-estado';
import { DiarioOficialEstadoController } from '../interfaces/controllers/diario-oficial/diario-oficial-estado-controller';
import { DiarioOficialMunicipioController } from '../interfaces/controllers/diario-oficial/diario-oficial-municipio-controller';
import { enviarEmail } from '../interfaces/controllers/email/send-email-controller';
import { DiarioOficialMunicipioWeb } from '../infrastructure/providers/gateways/diario-oficial/diario-oficial-municipio-web';
import { ConsultarDiarioOficialMunicipioUseCase } from '../usecases/diario-oficial/consultar-diario-oficial-municipio';

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

const diarioOficialEstadoWeb = new DiarioOficialEstadoWeb();
const consultarEstadoUseCase = new ConsultarDiarioOficialEstadoUseCase(diarioOficialEstadoWeb);
const diarioEstadoController = new DiarioOficialEstadoController(consultarEstadoUseCase);

router.post('/doe', (req, res) => diarioEstadoController.consultar(req, res)); 

const diarioOficialMunicipioWeb = new DiarioOficialMunicipioWeb();
const consultarMunicipioUseCase = new ConsultarDiarioOficialMunicipioUseCase(diarioOficialMunicipioWeb);
const diarioMunicipioController = new DiarioOficialMunicipioController(consultarMunicipioUseCase);

router.post('/diogrande', (req, res) => diarioMunicipioController.consultar(req, res)); 
