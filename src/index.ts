import express from 'express';
import { router } from './routes';	
import './infrastructure/node-cron/scheduler'; 

const server = express();
const PORT = 3000;

server.use(express.json());
server.use(router);

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
