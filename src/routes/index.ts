import { Router } from 'express';
import { HomeController } from '../interfaces/controllers/home-controller';
import { UserController } from '../interfaces/controllers/user-controller';
import { CreateUser } from '../usecases/create-user';
import { PrismaUserRepository } from '../infrastructure/repositories/prisma-user-repository';
import { ExercitoWebScraper } from '../infrastructure/web/exercito-web-scraper';
import { ExercitoUseCase } from '../usecases/exercito-use-case';

export const router = Router();

router.get('/', HomeController.welcome);

const userRepository = new PrismaUserRepository();
const createUser = new CreateUser(userRepository);
const userController = new UserController(createUser);

router.post('/users', (req, res) => userController.create(req, res));

const scraper = new ExercitoWebScraper();
const useCase = new ExercitoUseCase(scraper);

router.get('/exercito', async (req, res) => {
  try {
    const content = await useCase.execute();
    res.send(content);
  } catch (error) {
    res.status(500).send('Error fetching content from Exercito website');
  }
});
