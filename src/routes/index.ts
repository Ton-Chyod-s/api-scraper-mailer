import { Router } from 'express';
import { HomeController } from '../interfaces/controllers/HomeController';

export const router = Router();

router.get('/', HomeController.welcome);

