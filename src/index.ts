import { router } from './routes';	

const express = require('express');
const server = express();
const PORT = 3000;

server.use(express.json());
server.use(router);

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
