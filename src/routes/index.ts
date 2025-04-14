import { Router } from 'express';
import { HomeController } from '../interfaces/controllers/home-controller';
import { UserController } from '../interfaces/controllers/user-controller';
import { CreateUser } from '../usecases/create-user';
import { PrismaUserRepository } from '../infrastructure/repositories/prisma-user-repository';

export const router = Router();

router.get('/', HomeController.welcome);

const userRepository = new PrismaUserRepository();
const createUser = new CreateUser(userRepository);
const userController = new UserController(createUser);

router.post('/users', (req, res) => userController.create(req, res));

