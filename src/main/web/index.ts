import express from 'express';
import * as dotenv from 'dotenv';
import swaggerUi from "swagger-ui-express";
import { scheduleDailyTask } from '@main/jobs/scheduler';
import cors from 'cors';
import path from 'path';

dotenv.config();

const server = express();
const PORT = Number(process.env.PORT_SERVER) || 5050;

server.use(cors());
server.use(express.json());

server.use((req, res, next) => {
  res.setHeader('ngrok-skip-browser-warning', 'true');
  next();
});

server.set('view engine', 'ejs');
server.set('views', path.join(__dirname, 'views'));

server.use(express.urlencoded({ extended: true }));
server.use(express.static(path.join(__dirname, 'public')));

import { router } from '../../interfaces/routes';	
server.use(router);

import { swaggerSpec } from "./swagger";
server.use("/", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

scheduleDailyTask();

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor em execução em http://localhost:${PORT}`);
});
