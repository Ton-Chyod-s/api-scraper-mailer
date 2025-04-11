import { Request, Response } from 'express';

const express = require('express');
const server = express();
const PORT = 3000;

server.get('/', (req: Request, res: Response) => {
    return res.json({
        "": "Welcome to the Web Assist API! Here are the available"
    });
});

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
