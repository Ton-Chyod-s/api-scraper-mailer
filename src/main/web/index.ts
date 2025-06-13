import express from 'express';
import * as dotenv from 'dotenv';
import swaggerUi from "swagger-ui-express";
import { scheduleDailyTask } from './../../main/jobs/scheduler';

dotenv.config();

const server = express();
const PORT = Number(process.env.PORT_SERVER) || 5050;

server.use(express.json());

server.use((req, res, next) => {
  res.setHeader('ngrok-skip-browser-warning', 'true');
  next();
});

import { router } from '../../main/web/routes';	
server.use(router);

import { swaggerSpec } from "./swagger";
server.use("/", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

scheduleDailyTask();

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor em execução em http://localhost:${PORT}`);
});

