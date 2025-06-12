import express from 'express';
import * as dotenv from 'dotenv';
import swaggerUi from "swagger-ui-express";
import { scheduleDailyTask } from './../../main/jobs/scheduler';

dotenv.config();

const server = express();
const PORT = process.env.PORT_SERVER || 3000;

server.use(express.json());

import { router } from '../../main/web/routes';	
server.use(router);

import { swaggerSpec } from "./swagger";
server.use("/", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

scheduleDailyTask();

server.listen(PORT, () => {
    console.log(`Servidor em execução em http://localhost:${PORT}`);
});
