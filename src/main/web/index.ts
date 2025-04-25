import express from 'express';
import { router } from '../../main/web/routes';	
import '../../infrastructure/node-cron/scheduler'; 

const server = express();
const PORT = process.env.PORT_SERVER || 3000
|| 3000;

server.use(express.json());
server.use(router);

server.listen(PORT, () => {
    console.log(`Servidor em execução em http://localhost:${PORT}`);
});
